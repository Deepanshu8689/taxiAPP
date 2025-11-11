import { Injectable } from '@nestjs/common';
import NodeGeocoder from 'node-geocoder';
import { v2 as cloudinary } from 'cloudinary';
import * as fs from 'fs';

@Injectable()
export class CommonService {
    private geoCoder
    constructor() {
        this.geoCoder = NodeGeocoder({
            provider: 'opencage',
            apiKey: process.env.OPENCAGE_KEY,
        })
    }

    async deleteImage(publicId: string){
        try {
            const result = await cloudinary.uploader.destroy(publicId);
            return result
        } catch (error) {
            console.log("error in deleteImage: ", error)
            throw error
        }
    }

    async getCoordinatesFromAddress(address: string) {
        const res = await this.geoCoder.geocode(address);
        if (!res.length) throw new Error('Address not found');
        // console.log("res: ", res)

        const { latitude, longitude } = res[0];
        return { latitude, longitude };
    }

    async currentLocation(user: any, dto: any) {
        try {
            const res = await this.geoCoder.reverse({
                lat: dto.latitude,
                lon: dto.longitude
            })

            const loc = res[0];
            const addressParts = [
                loc.streetNumber,
                loc.streetName,
                loc.city,
                loc.state,
                loc.zipcode,
                loc.country
            ].filter(Boolean);

            const formatted = addressParts.join(', ');
            console.log("formatted: ", formatted)
            return formatted

        } catch (error) {
            console.log("error in currentLocation: ", error)
            throw error
        }
    }

    haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
        try {

            const toRad = (deg: number) => (deg * Math.PI) / 180;

            const R = 6371; // Earth's radius in km
            const dLat = toRad(lat2 - lat1);
            const dLon = toRad(lon2 - lon1);

            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(toRad(lat1)) *
                Math.cos(toRad(lat2)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);

            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

            const distance = R * c; // distance in kilometers
            return Number(distance.toFixed(2));

        } catch (error) {
            console.log("error in haversineDistance: ", error)
            throw error
        }
    }

    time(startTime?: Date) {
        const date = startTime || new Date();
        const hours = date.getHours();
        const minutes = date.getMinutes();

        // Format to HH:MM
        const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}`;

        // Convert to total minutes
        const totalMinutes = hours * 60 + minutes;

        return {
            formattedTime,
            totalMinutes
        }
    }

}
