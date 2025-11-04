import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Model } from "mongoose";
import { GetFareDTO, RequestRideDTO } from "src/dto/requestRide.dto";
import { Ride, RideDocument } from "src/schema/ride.schema";
import { CommonService } from "../common/common.service";
import { Vehicle, VehicleDocument } from "src/schema/vehicle.schema";
import { RideStatus } from "src/enum/rideStatus.enum";
import { User, UserDocument } from "src/schema/user.schema";
import { Role } from "src/enum/role.enum";
import { ConfigService } from "@nestjs/config";
import { Earning, EarningDocument } from "src/schema/earning.schema";
import { WalletService } from "../wallet/wallet.service";

@Injectable()
export class RideRepository {
    constructor(
        @InjectModel(Ride.name) private rideSchema: Model<RideDocument>,
        @InjectModel(User.name) private userSchema: Model<UserDocument>,
        @InjectModel(Earning.name) private earningSchema: Model<EarningDocument>,
        @InjectModel(Vehicle.name) private vehicleSchema: Model<VehicleDocument>,
        private commonService: CommonService,
        private configService: ConfigService,
        private walletService: WalletService
    ) { }

    private baseModel(vehicleType: string) {
        switch (vehicleType) {
            case 'bike lite':
                return {
                    baseFare: 15,
                    costPerKm: 5,
                    costPerMinute: 1
                }
            case 'bike':
                return {
                    baseFare: 20,
                    costPerKm: 6,
                    costPerMinute: 1
                }
            case 'auto':
                return {
                    baseFare: 30,
                    costPerKm: 9,
                    costPerMinute: 2
                }
            case 'cab economy':
                return {
                    baseFare: 50,
                    costPerKm: 12,
                    costPerMinute: 3
                }
            case 'cab premium':
                return {
                    baseFare: 60,
                    costPerKm: 15,
                    costPerMinute: 3
                }
            case 'cab xl':
                return {
                    baseFare: 75,
                    costPerKm: 20,
                    costPerMinute: 4
                }
            default:
                break;
        }
    }

    private averageSpeed(vehicleType: string) {
        switch (vehicleType) {
            case 'bike lite':
                return 30
            case 'bike':
                return 30
            case 'auto':
                return 25
            case 'cab economy':
                return 45
            case 'cab premium':
                return 45
            case 'cab xl':
                return 45
            default:
                break;
        }
    }

    private duration(vehicleType: string, distanceKM: number) {
        const speed = this.averageSpeed(vehicleType)
        const durationMin = (distanceKM / speed) * 60
        return Number(durationMin.toFixed(2))
    }

    private estimateFare(vehicleType: string, distanceKM: number, durationMin?: number) {
        const { baseFare, costPerKm, costPerMinute } = this.baseModel(vehicleType)
        // console.log("baseFare: ", baseFare)
        durationMin
            ? durationMin
            : durationMin = this.duration(vehicleType, distanceKM)
        const cost = baseFare + (distanceKM * costPerKm) + (durationMin * costPerMinute)
        return { cost: Number(cost.toFixed(2)), durationMin }
    }

    // actual logic to create ride
    async getFares(dto: GetFareDTO, user: any) {
        try {
            const { pickupLocation, dropLocation } = dto;
            const pickUpCoords = await this.commonService.getCoordinatesFromAddress(pickupLocation)
            const dropCoords = await this.commonService.getCoordinatesFromAddress(dropLocation)

            // console.log("pickUpCoords: ", pickUpCoords)
            // console.log("dropCoords: ", dropCoords)

            const distance = await this.commonService.haversineDistance(
                pickUpCoords.latitude,
                pickUpCoords.longitude,
                dropCoords.latitude,
                dropCoords.longitude
            )

            const bikeLiteFare: { cost: Number, durationMin: Number } = this.estimateFare('bike lite', distance)
            const bikeFare: { cost: Number, durationMin: Number } = this.estimateFare('bike', distance)
            const autoFare: { cost: Number, durationMin: Number } = this.estimateFare('auto', distance)
            const cabEconomyFare: { cost: Number, durationMin: Number } = this.estimateFare('cab economy', distance)
            const cabPremiumFare: { cost: Number, durationMin: Number } = this.estimateFare('cab premium', distance)
            const cabXLFare: { cost: Number, durationMin: Number } = this.estimateFare('cab xl', distance)

            let fares = []
            fares = [
                { "vehicleType": "bike lite", "estimatedFare": bikeLiteFare.cost, "durationMin": bikeLiteFare.durationMin },
                { "vehicleType": "bike", "estimatedFare": bikeFare.cost, "durationMin": bikeFare.durationMin },
                { "vehicleType": "auto", "estimatedFare": autoFare.cost, "durationMin": autoFare.durationMin },
                { "vehicleType": "cab economy", "estimatedFare": cabEconomyFare.cost, "durationMin": cabEconomyFare.durationMin },
                { "vehicleType": "cab premium", "estimatedFare": cabPremiumFare.cost, "durationMin": cabPremiumFare.durationMin },
                { "vehicleType": "cab xl", "estimatedFare": cabXLFare.cost, "durationMin": cabXLFare.durationMin },
            ]

            // console.log("fares: ", fares)
            return { fares, distance, pickUpCoords, dropCoords }

        } catch (error) {
            console.log("error in requestRide: ", error)
            throw error
        }

    }

    async bookRide(user: any, dto: RequestRideDTO) {
        try {
            const { pickupLocation, dropLocation, vehicleType, distance, estimatedFare, pickupLat, pickupLng, dropLat, dropLng } = dto
            const rider = await this.userSchema.findById(user.sub)

            const createdRide = await this.rideSchema.create({
                pickupLocation,
                dropLocation,
                rider: rider._id,
                vehicleType,
                distance,
                estimatedFare,
                pickupLat,
                pickupLng,
                dropLat,
                dropLng
            })

            return createdRide

        } catch (error) {
            console.log("error in bookRide: ", error)
            throw error
        }

    }

    async cancelRide(id: string, user?: any) {
        try {
            await this.rideSchema.findByIdAndDelete(id)

            if (user.role === 'driver') {
                const updateDriver = await this.userSchema.findOneAndUpdate(
                    { _id: user.sub },
                    { $set: { status: 'available' } },
                    { new: true }
                )
                return {
                    message: "Ride cancelled successfully",
                    updateDriver
                }
            }

            return {
                message: "Ride cancelled successfully"
            }

        } catch (error) {
            console.log("error in cancelRide: ", error)
            throw error
        }
    }

    async assignDriver(rideId: string, driverId: string) {
        try {

            const driver = await this.userSchema.findById(driverId).populate('vehicle')
            if (driver.status !== 'available' || driver.isVerified !== true) {
                throw new Error("Driver is not available")
            }

            const vehicleNumber = driver.vehicle.vehicleNumber

            const vehicle = await this.vehicleSchema.findOne({ vehicleNumber })
            if (!vehicle) {
                throw new Error("Vehicle not found")
            }

            const updatedRide = await this.rideSchema.findOneAndUpdate(
                { _id: rideId, status: 'requested' },
                {
                    $set: {
                        driver: driver._id,
                        vehicle: vehicle._id,
                        status: RideStatus.Accepted
                    }
                },
                { new: true }
            )

            if (!updatedRide) {
                throw new Error("Driver not assigned to ride")
            }

            driver.status = 'busy'
            await driver.save()

            return {
                message: "Driver assigned successfully",
                updatedRide
            }

        } catch (error) {
            console.log("error in assignDriver: ", error)
            throw error
        }
    }

    async startRide(rideId: string) {
        try {
            console.log("time: ", new Date())

            const ride = await this.rideSchema.findOneAndUpdate(
                { _id: rideId, status: 'accepted' },
                {
                    status: RideStatus.Started,
                    startTime: new Date()
                },
                {
                    new: true
                }
            )
            if (!ride) {
                throw new Error("Ride not found")
            }

            return {
                message: "Ride started successfully",
                ride
            }

        } catch (error) {
            console.log("error in startRide: ", error)
            throw error
        }
    }

    async rideComplete(rideId: string) {
        try {

            const ride = await this.rideSchema.findById(rideId)

            const startTime = this.commonService.time(ride.startTime)
            const endTime = this.commonService.time()

            const actualMinutes = endTime.totalMinutes - startTime.totalMinutes

            const distance = ride.distance
            const actualFare = this.estimateFare(ride.vehicleType, distance, actualMinutes)

            if (actualFare.cost < ride.estimatedFare) {
                ride.actualFare = ride.estimatedFare
            }
            else {
                ride.actualFare = actualFare.cost
            }
            ride.status = RideStatus.Completed
            ride.endTime = new Date();
            await ride.save()

            const driver = await this.userSchema.findByIdAndUpdate(
                { _id: ride.driver },
                {
                    $push: {
                        completedRides: rideId
                    },
                    $set: {
                        status: 'available',
                    }
                }
            )

            const rider = await this.userSchema.findByIdAndUpdate(
                { _id: ride.rider },
                {
                    $push: {
                        completedRides: rideId
                    }
                }
            )
            return {
                ride,
                driver,
                rider
            }

        } catch (error) {
            console.log("error in rideComplete: ", error)
            throw error
        }
    }

    async findDrivers(rideId: string) {
        try {
            const ride = await this.rideSchema.findById(rideId)

            const drivers = await this.userSchema.find(
                { status: 'available', isVerified: true, role: Role.Driver },
            ).select("firstName image lastName phoneNumber vehicle")
                .populate({
                    path: 'vehicle',
                    match: { vehicleType: ride.vehicleType },
                    select: 'vehicleName vehicleNumber vehicleType vehicleColor vehicleImage'
                })

            return drivers
        } catch (error) {
            console.log("error in findDrivers: ", error)
            throw error
        }
    }

    currentDistance(lat1: any, long1: any, lat2: any, long2: any, vehicleType: any) {
        try {

            const distance = this.commonService.haversineDistance(lat1, long1, lat2, long2)
            const duration = this.duration(vehicleType, distance)
            return {
                distance,
                duration
            }

        } catch (error) {
            console.log("error in currentDistance: ", error)
            throw error
        }
    }

    async getAcceptedRide(id: string) {

        try {
            const ride = await this.rideSchema.findOne({
                status: RideStatus.Accepted,
                $or: [
                    { rider: new mongoose.Types.ObjectId(id) },
                    { driver: new mongoose.Types.ObjectId(id) }
                ],
            }).populate({
                path: 'rider',
                select: 'firstName lastName phoneNumber latitude longitude',
            }).populate({
                path: 'driver',
                select: 'firstName lastName image phoneNumber age vehicle latitude longitude',
            }).populate({
                path: 'vehicle',
                select: 'vehicleName vehicleNumber vehicleType vehicleColor vehicleImage',
            })

            // if(!ride){
            //     // throw new Error("Ride not found")
            //     return null
            // }

            return {
                message: "Ride found successfully",
                ride
            }

        } catch (error) {
            console.log("error in getAcceptedRide: ", error)
            throw error
        }

    }

    async finalizeEarningforRide(rideId: string, paymentMethod: string) {
        try {
            const ride = await this.rideSchema.findOne({
                _id: rideId,
                status: RideStatus.Completed
            })

            if (!ride) {
                throw new Error("Ride not found")
            }

            const commission_rate = this.configService.get<number>('COMMISSION_RATE');
            const gst_rate = this.configService.get<number>('GST_RATE');

            const grossAmount = ride.actualFare
            const commission = commission_rate * grossAmount
            const gstOnCommission = gst_rate * commission
            const totalCut = commission + gstOnCommission
            const netAmount = grossAmount - totalCut

            const existingEarning = await this.earningSchema.findOne({
                ride: ride._id
            })
            if(existingEarning) {
                throw new Error("Earning already exists for this ride")
            }

            const earning = await this.earningSchema.create({
                ride: ride._id,
                rider: ride.rider,
                driver: ride.driver,
                grossAmount: Number(grossAmount.toFixed(2)),
                commission: Number(commission.toFixed(2)),
                gstOnCommission: Number(gstOnCommission.toFixed(2)),
                totalCut: Number(totalCut.toFixed(2)),
                netAmount: Number(netAmount.toFixed(2)),
                paymentMethod,
                date: new Date()
            })

            if (paymentMethod === "cash") {
                await this.walletService.deductMoneyFromCash(String(ride.driver), grossAmount, totalCut)
            }
            else if (paymentMethod === "online") {
                await this.walletService.deductMoneyFromOnline(String(ride.driver), netAmount, totalCut)
            }

            return {
                message: "Earning created successfully",
                earning
            }

        }
        catch (error) {
            console.log("error in finalizeEarningforRide: ", error)
            throw error
        }
    }

}