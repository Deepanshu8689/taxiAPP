import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import { randomUUID } from 'crypto';
import { Model } from 'mongoose';
import Razorpay from 'razorpay';
import { BankPayoutDTO, PayoutDTO } from 'src/dto/payout.dto';
import { User, UserDocument } from 'src/schema/user.schema';

@Injectable()
export class PayoutService {

    private razorpay: Razorpay
    private readonly BASE_URL = 'https://api.razorpay.com/v1';
    private key_id = process.env.RAZORPAY_KEY_ID
    private key_secret = process.env.RAZORPAY_KEY_SECRET
    private accountNumber = process.env.RAZORPAY_ACCOUNT_NUMBER

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

    async createFundAccount(contactId: string, bankDetails: any) {
        try {
            // const contact = await this.fetchContact(driverId)
            const { vpaAddress, type, accountNumber, IFSCcode} = bankDetails

            const driver = await this.userSchema.findOne({ razorpayContactId: contactId })

            const payload = type === 'vpa'
                ? {
                    account_type: type,
                    contact_id: contactId,
                    vpa: {
                        address: vpaAddress
                    }
                }
                : {
                    contact_id: contactId,
                    account_type: type,
                    bank_account: {
                        name: `${driver.firstName} ${driver.lastName}`,
                        ifsc: IFSCcode,
                        account_number: accountNumber,
                    }
                }

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

    async createPayoutViaVpa(dto: PayoutDTO, id: string){
        try {
            const driver = await this.userSchema.findById(id)
            if(!driver){
                throw new Error("Driver not found")
            }

            if(!driver.razorpayFundAccountId){
                throw new Error("Driver's fund account not found")
            }

            if(driver.availableBalance > 0){
                driver.availableBalance -= dto.amount
            }


            const { fund_account_id, amount, referenceId} = dto

            const idempotencyKey = randomUUID();
            const payload = {
                account_number: this.accountNumber,
                fund_account_id,
                amount: amount * 100,
                currency: "INR",
                mode: "UPI", 
                purpose: "payout",
                queue_if_low_balance: true,
                reference_id: referenceId
            }
            const response = await axios.post(`${this.BASE_URL}/payouts`,
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Payout-Idempotency': idempotencyKey
                    },
                    auth: {
                        username: this.key_id,
                        password: this.key_secret
                    }
                }
            )
            await driver.save()

            console.log("Payout response: ", response.data)
            return response.data
        } catch (error) {
            console.log("error in createPayout: ", error.response?.data ||error)
            throw error
        } 
    }
    async createPayoutViaBank(dto: BankPayoutDTO, id: string){
        try {
            const driver = await this.userSchema.findById(id)
            if(!driver){
                throw new Error("Driver not found")
            }

            if(!driver.razorpayFundAccountId){
                throw new Error("Driver's fund account not found")
            }

            if(driver.availableBalance > 0){
                driver.availableBalance -= dto.amount
            }

            const { fundAccountId, amount, referenceId, mode} = dto

            const idempotencyKey = randomUUID();
            const payload = {
                account_number: this.accountNumber,
                fund_account_id: fundAccountId,
                amount: amount* 100,
                currency: "INR",
                mode: mode || "NEFT", 
                purpose: "payout",
                queue_if_low_balance: true,
                reference_id: referenceId
            }
            const response = await axios.post(`${this.BASE_URL}/payouts`,
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Payout-Idempotency': idempotencyKey
                    },
                    auth: {
                        username: this.key_id,
                        password: this.key_secret
                    }
                }
            )
            await driver.save()

            console.log("Payout response: ", response.data)
            return response.data
        } catch (error) {
            console.log("error in createPayout: ", error)
            throw error
        } 
    }
}
