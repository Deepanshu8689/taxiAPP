import { Body, Controller, Get, Param, Patch, Query, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { Roles } from 'src/common/decorators/role.decorator';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';
import { Role } from 'src/enum/role.enum';
import { RoleGuard } from 'src/common/guards/role/role.guard';
import { AdminService } from './admin.service';
import { User } from 'src/common/decorators/req-user.decorator';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { multerUserConfig } from 'src/config/multer.config';
import { UpdateUserDTO } from 'src/dto/updateUser.dto';

@Controller('admin')
@UseGuards(AuthGuard, RoleGuard)
@Roles(Role.Admin)
export class AdminController {
    constructor(
        private adminService: AdminService
    ) { }

    @Get('/getProfile')
    async getProfile(@User() user: any) {
        return await this.adminService.getProfile(user);
    }

    @Patch('/verifyVehicle/:id')
    async verifyVehicle(
        @Param('id') id: string,
    ) {
        return await this.adminService.verifyVehicle(id)
    }

    @Patch('/verifyDriver/:id')
    async verifyDriver(
        @Param('id') id: string,
    ) {
        return await this.adminService.verifyDriver(id)
    }

    @Patch('/updatePassword')
    async updatePassword(
        @User() user: any,
        @Body() body: any
    ) {
        return await this.adminService.updatePassword(user, body.password, body.newPassword, body.confirmNewPassword)
    }


    @Patch('/updateProfile')
    @UseInterceptors(
        FileInterceptor('file', multerUserConfig)
    )
    async updateProfile(
        @User() user: any,
        @Body() dto: UpdateUserDTO,
        @UploadedFile() file: Express.Multer.File
    ) {
        dto.image = file?.path || '';
        return this.adminService.updateProfile(user, dto)
    }


    @Get('/allUsers')
    async getAllUsers() {
        return await this.adminService.fetchAllUsers()
    }

    @Get('/allDrivers')
    async getAllDrivers(@Query('verified') verified?: string){
        console.log("filter in controller: ", verified)
        return await this.adminService.fetchAllDrivers(verified)
    }

    @Get('allRides')
    async getAllRides(@Query('status') status?: string){
        return await this.adminService.getAllRides(status)
    }

    @Patch('/suspendDriver/:id')
    async suspendDriver(@Param('id') id: string){
        return await this.adminService.suspendDriver(id)
    }

    @Get('analytics')
    async getAnalytics(){
        return await this.adminService.getAnalytics()
    }

    @Get('/earnings')
    async getEarnings(){
        return await this.adminService.getEarnings()
    }

}
