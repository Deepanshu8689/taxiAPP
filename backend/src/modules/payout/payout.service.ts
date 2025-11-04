import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import { Model, Types } from 'mongoose';
import Razorpay from 'razorpay';
import { User, UserDocument } from 'src/schema/user.schema';

@Injectable()
export class PayoutService {

    private razorpay: Razorpay
    private readonly BASE_URL = 'https://api.razorpay.com/v1';
    private key_id = process.env.RAZORPAY_KEY_ID
    private key_secret = process.env.RAZORPAY_KEY_SECRET

    constructor(
        private configService: ConfigService,
        @InjectModel(User.name) private userSchema: Model<UserDocument>,
    ) { }

    async createContact(id: string,) {
        try {

            const customer = await this.userSchema.findById(id);
            if (!customer) {
                throw new Error("Driver not found")
            }
            const payload = {
                name: `${customer.firstName} ${customer.lastName}`,
                email: customer.emailId,
                contact: customer.phoneNumber,
                type: 'vendor',
                reference_id: id,
                notes: {
                    notes_key_1: 'Hi there,',
                    notes_key_2: 'How are you?'
                }
            }


            const response = await axios.post(`${this.BASE_URL}/contacts`,
                payload,
                {
                    auth: {
                        username: this.key_id,
                        password: this.key_secret
                    },
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            )

            if (response.data) {
                customer.razorpayContactId = response.data.id
                await customer.save()
                return response.data
            }
            else {
                throw new Error("Failed to create contact")
            }

        } catch (error) {
            console.log("error in createContact: ", error)
            throw error
        }
    }

    async fetchContact(id: string) {
        try {
            const response = await axios.get(`${this.BASE_URL}/contacts/${id}`,
                {
                    auth: {
                        username: this.key_id,
                        password: this.key_secret
                    },
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            )

            if (response.data) {
                return response.data
            }
            else {
                throw new Error("Failed to fetch contact")
            }

        } catch (error) {
            console.log("error in fetchContact: ", error)
            throw error
        }
    }

    async createFundAccount(id: string, bankDetails: any) {
        try {
            // const contact = await this.fetchContact(driverId)
            const { vpaAddress, type } = bankDetails

            const driver = await this.userSchema.findOne({razorpayContactId: id})
            const vpaPayload = {
                account_type: "vpa",
                contact_id: id,
                vpa: {
                    address: vpaAddress
                }
            }
            const bankPayload = {
                contact_id: id,
                account_type: "bank_account",
                bank_account: {
                    name: `${driver.firstName} ${driver.lastName}`, 
                    ifsc: bankDetails.ifsc,
                    account_number: bankDetails.accountNumber,
                }
            }

            const payload = type === 'vpa' ? vpaPayload : bankPayload

            const response = await axios.post(`${this.BASE_URL}/fund_accounts`,
                payload,
                {
                    auth: {
                        username: this.key_id,
                        password: this.key_secret
                    },
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            )
            if (response.data) {
                driver.razorpayFundAccountId = response.data.id
                await driver.save()
                return response.data
            }
            else {
                throw new Error("Failed to fetch contact")
            }
        } catch (error) {
            console.log("error in createFundAccount: ", error)
            throw error
        }

    }
}
