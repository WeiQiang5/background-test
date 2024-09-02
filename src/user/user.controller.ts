import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Inject,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
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
}
