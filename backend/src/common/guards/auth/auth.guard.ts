import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private jwtService: JwtService) {}
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean>{
    try {

      const request = context.switchToHttp().getRequest();
      const authHeader = request.headers['authorization'];
      
      const token = request.cookies['token'] 
                    || request.body?.token
                    || (authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null);

      if(!token){
         throw new UnauthorizedException('Token not found');
      }

      const decode = await this.jwtService.verifyAsync(token);
      request.user = decode;

      // console.log("user: ", request.user)
      return true;
      

    } catch (error) {
      console.log("error: ", error)
    }
  }
}
