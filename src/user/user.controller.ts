import {
  Controller,
  Get,
  Post,
  Body,
  Inject,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/register-user.dto';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { EmailService } from 'src/email/email.service';
import { RedisService } from 'src/redis/redis.service';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { GetUserInfo, RequireLogin } from 'src/decorator/user.decorator';
import { UserDetailVo } from './vo/user-details.vo';
import { User } from './entities/user.entity';
import { UpdateUserPasswordDto } from './dto/update-password.dto';

@ApiTags('用户')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Inject(EmailService)
  private emailService: EmailService;
  @Inject(RedisService)
  private redisService: RedisService;
  @Inject(JwtService)
  private jwtService: JwtService;

  @Post('register')
  @ApiBody({ type: RegisterUserDto })
  @ApiOkResponse({ type: RegisterUserDto })
  @ApiOperation({ summary: '用户注册' })
  create(@Body() registerUser: RegisterUserDto) {
    console.log(registerUser);
    return this.userService.register(registerUser);
  }

  @Get('register-captcha')
  @ApiQuery({ type: String })
  @ApiOkResponse({ type: String })
  @ApiOperation({ summary: '用户注册验证码' })
  async captcha(@Query('address') address: string) {
    const code = Math.random().toString().slice(2, 8);

    await this.redisService.set(`captcha_${address}`, code);

    await this.emailService.sendMail({
      to: address,
      subject: '注册验证码',
      html: `<p>你的注册验证码是 ${code}</p>`,
    });
    return '发送成功';
  }

  @Post('login')
  @ApiBody({ type: LoginUserDto })
  @ApiOkResponse({ type: LoginUserDto })
  @ApiOperation({ summary: '用户登录' })
  async login(@Body() loginUserDto: LoginUserDto) {
    return await this.userService.login(loginUserDto);
  }

  @Get('refresh')
  @ApiQuery({ type: String })
  @ApiOperation({ summary: 'token刷新' })
  async refresh(@Query('refreshToken') refreshToken: string) {
    try {
      const data = this.jwtService.verify(refreshToken);
      const user = await this.userService.findUserById(data.userId);

      const { access_token, refresh_token } = this.userService.getToken(user);

      return {
        access_token,
        refresh_token,
      };
    } catch (e) {
      throw new UnauthorizedException('token已失效,请重新登录');
    }
  }

  @Get('info')
  @RequireLogin()
  @ApiOkResponse({ type: UserDetailVo })
  @ApiOperation({ summary: '获取用户信息' })
  async getInfo(@GetUserInfo('userId') userId: number) {
    const user = await this.userService.findUserDetailById(userId);

    const vo = new UserDetailVo();
    vo.id = user.id;
    vo.email = user.email;
    vo.username = user.username;
    vo.headPic = user.headPic;
    vo.phoneNumber = user.phoneNumber;
    vo.nickName = user.nickName;
    vo.createTime = user.createTime;
    vo.isFrozen = user.isFrozen;
    return vo;
  }

  @Post('updatePassword')
  @RequireLogin()
  @ApiOperation({ summary: '修改密码' })
  async updatePassword(
    @GetUserInfo('userId') userId: number,
    @Body() passwordDto: UpdateUserPasswordDto,
  ) {
    return await this.userService.updatePassword(userId, passwordDto);
  }

  @Get('updatePassword/sendCaptcha')
  @ApiOperation({ summary: '发送修改密码的验证码' })
  async updatePasswordSendCaptcha(@Query('address') address: string) {
    return await this.userService.updatePasswordSendCaptcha(address);
  }
}
