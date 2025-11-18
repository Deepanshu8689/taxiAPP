import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { Model } from 'mongoose';
import { SupportChat, SupportChatDocument } from 'src/schema/supportChat.schema';

@Injectable()
export class ChatService {
    constructor(
        @InjectModel(SupportChat.name) private supportChatSchema: Model<SupportChatDocument>,
    ) { }

    async generateTicket(user: any) {
        try {

            const chat = await this.supportChatSchema.findOne({
                userId: user.sub,
                status: 'open',
            })

            if (chat) {
                return {
                    success: false,
                    message: "Ticket already exists",
                }
            }
            const ticketId = randomUUID()

            const newChat = await this.supportChatSchema.create({
                userId: user.sub,
                status: 'open',
                userRole: user.role,
                ticketId,
                messages: []
            })

            return newChat;

        } catch (error) {
            console.log("error in generateTicket: ", error)
            throw error
        }
    }

    async closeTicket(user: any, ticketId: string) {
        try {

            const chat = await this.supportChatSchema.findOneAndUpdate(
                { userId: user.sub, status: 'open', ticketId },
                {
                    status: 'closed'
                },
                { new: true }
            )

            if (!chat) {
                return {
                    success: false,
                    message: "Ticket not found",
                }
            }

            return chat
        } catch (error) {
            console.log("error in closeTicket: ", error)
            throw error
        }
    }

    async sendMessage(user: any, message: string, ticketId: string) {
        try {

            let chat = await this.supportChatSchema.findOneAndUpdate(
                { userId: user.sub, status: 'open', ticketId },
                {
                    $push: {
                        messages: {
                            senderId: user.sub,
                            senderRole: user.role,
                            content: message,
                        }
                    }
                },
                { new: true }
            )

            if (!chat) {
                return {
                    success: false,
                    message: "Ticket not found",
                }
            }

            const sentMessage = chat.messages[chat.messages.length - 1]

            return { chat, sentMessage }

        } catch (error) {
            console.log("error in sendMessage: ", error)
            throw error
        }
    }

    async getChat(chatId: string) {
        try {
            const chat = await this.supportChatSchema.findById(chatId)
            if (!chat) {
                return {
                    message: "Generate a Ticket to chat with support",
                }
            }
            return chat
        } catch (error) {
            console.log("error in getChat: ", error)
            throw error
        }
    }

    async initiateChat(user: any){
        try {
            const chat = await this.supportChatSchema.findOne({
                userId: user.sub,
                status: 'open'
            })

            if(!chat){
                return {
                    success: false,
                    message: "Generate a Ticket to chat with support",
                }
            }
            return chat
        } catch (error) {
            console.log("error in fetchChat: ", error)
            throw error
        }
    }

    async userChats(user: any){
        try {
            const chats = await this.supportChatSchema.find({
                userId: user.sub
            }).sort({ createdAt: -1 })
            return chats
        } catch (error) {
            console.log("error in userChats: ", error)
            throw error
        }
    }

    async getAllChats() {
        try {
            const chats = await this.supportChatSchema.find()
            if (!chats) return {
                message: "No chats found"
            }
            return chats
        } catch (error) {
            console.log("error in getAllChats: ", error)
            throw error
        }
    }

    async replyToUser(user: any, chatId: string, message: string) {
        try {

            let chat = await this.supportChatSchema.findOneAndUpdate(
                {
                    _id: chatId,
                    status: 'open'
                },
                {
                    $push: {
                        messages: {
                            senderId: user.sub,
                            senderRole: 'support',
                            content: message
                        }
                    }
                },
                { new: true }
            )

            if (!chat) {
                return {
                    success: false,
                    message: "Ticket closed",
                }
            }

            const sentMessage = chat.messages[chat.messages.length - 1]

            return { chat, sentMessage }

        } catch (error) {
            console.log("error in replyToUser: ", error)
            throw error
        }
    }
}
