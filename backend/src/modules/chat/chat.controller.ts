import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { User } from 'src/common/decorators/req-user.decorator';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';
import { RoleGuard } from 'src/common/guards/role/role.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from 'src/enum/role.enum';

@Controller('chat')
@UseGuards(AuthGuard, RoleGuard)
export class ChatController {
    constructor(
        private chatService: ChatService
    ) {}

    @Post('/generate-ticket')
    @Roles(Role.Driver, Role.User)
    async generateTicket(@User() user: any){
        return this.chatService.generateTicket(user)
    }   

    @Post('/close-ticket/:ticketId')
    async closeTicket(
        @User() user: any,
        @Param('ticketId') ticketId: string
    ){
        return this.chatService.closeTicket(user, ticketId)
    }

    @Post('/sendMessage/:ticketId')
    @Roles(Role.Driver, Role.User)
    async sendMessage(
        @User() user: any,
        @Body('message') message: string,
        @Param('ticketId') ticketId: string
    ){
        return this.chatService.sendMessage(user, message, ticketId)
    }

    @Get('/getChat/:chatId')
    async getChat(
        @Param('chatId') chatId: string
    ){
        return this.chatService.getChat(chatId)
    }

    @Get('/initialChat')
    @Roles(Role.Driver, Role.User)
    async fetchChat( 
        @User() user:any
    ){
        return this.chatService.initiateChat(user)
    }

    @Get('/userChats')
    async userChats(@User() user: any){
        return this.chatService.userChats(user)
    }

    @Get('/getAllChats')
    @Roles(Role.Admin)
    async getAllChats(){
        return this.chatService.getAllChats()
    }

    @Post('/replyToUser/:chatId')
    @Roles(Role.Admin)
    async replyToUser(
        @User() user: any,
        @Body('message') message: string,
        @Param('chatId') chatId: string
    ){
        return this.chatService.replyToUser(user, chatId, message)
    }
}
