import { Controller, Get, SetMetadata } from '@nestjs/common';
import { AppService } from './app.service';
import {
  GetUserInfo,
  RequireLogin,
  RequirePermissions,
} from './decorator/user.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('aaa')
  @RequireLogin()
  @RequirePermissions('ddd')
  aaa(@GetUserInfo('username') username: string, @GetUserInfo() userInfo) {
    console.log('username: ' + username);
    console.log('userInfo: ' + userInfo);
    return 'aaa';
  }

  @Get('bbb')
  bbb() {
    return 'bbbb';
  }
}
