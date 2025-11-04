import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/schema/user.schema';

@Injectable()
export class WalletService {
    constructor(
        @InjectModel(User.name) private userSchema: Model<UserDocument>,
    ){}

    async deductMoneyFromCash(driverId: string, grossAmount: number, totalCut: number) {
        try {
            const netAmount = grossAmount - totalCut
            const driver = await this.userSchema.findByIdAndUpdate(
                {_id: driverId},
                {
                    $inc: {
                        pendingBalance: -totalCut,
                        totalEarnings: +grossAmount,
                    }
                },
                {new: true}
            )

            driver.pendingBalance = Number(driver.pendingBalance.toFixed(2))
            driver.availableBalance = Number(driver.availableBalance.toFixed(2))
            driver.totalEarnings = Number(driver.totalEarnings.toFixed(2))
            await driver.save()

            return {
                pendingBalance: driver.pendingBalance,
                totalEarnings: driver.totalEarnings,
                availableBalance: driver.availableBalance
            }

        } catch (error) {
            console.log("error in deductMoneyFromCash: ", error)
            throw error
        }
    }

    async deductMoneyFromOnline(driverId: string, grossAmount: number, totalCut: number) {
        try {
            const netAmount = grossAmount - totalCut

            const driver = await this.userSchema.findById(driverId)
            if(!driver) {
                throw new Error("Driver not found")
            }

            const balance = netAmount - driver.pendingBalance 
            if(balance < 0) {
                driver.pendingBalance = balance
            }
            else{
                driver.pendingBalance = 0
                driver.availableBalance += balance
            }
            driver.totalEarnings += grossAmount,

            driver.pendingBalance = Number(driver.pendingBalance.toFixed(2))
            driver.availableBalance = Number(driver.availableBalance.toFixed(2))
            driver.totalEarnings = Number(driver.totalEarnings.toFixed(2))
            await driver.save()
            

            return {
                pendingBalance: driver.pendingBalance,
                totalEarnings: driver.totalEarnings,
                availableBalance: driver.availableBalance
            }

        } catch (error) {
            console.log("error in deductMoneyFromOnline: ", error)
            throw error
        }
    }
}
