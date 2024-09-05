import {
  Controller,
  Get,
  Post,
  Body,
  Inject,
  Query,
  UnauthorizedException,
  Param,
  DefaultValuePipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/register-user.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { EmailService } from 'src/email/email.service';
import { RedisService } from 'src/redis/redis.service';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { GetUserInfo, RequireLogin } from 'src/decorator/user.decorator';
import { UserDetailVo } from './vo/user-details.vo';
import { UpdateUserPasswordDto } from './dto/update-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from 'src/utils/req-list-query';
import { generateParseIntPipe } from 'src/utils/pipe';

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

  @Get('list')
  @ApiOperation({ summary: '获取全部用户' })
  async list(
    @Query(
      'pageSize',
      new DefaultValuePipe(1),
      generateParseIntPipe('pageSize'),
    )
    pageSize: number,
    @Query('pageNo', new DefaultValuePipe(1), generateParseIntPipe('pageNo'))
    pageNo: number,
    @Query('username') username: string,
    @Query('nickName') nickName: string,
    @Query('email') email: string,
  ) {
    console.log('list', pageSize);
    return await this.userService.findUsersByPage(
      username,
      nickName,
      email,
      pageNo,
      pageSize,
    );
  }
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
    console.log(loginUserDto);
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
  @ApiOperation({ summary: '修改密码' })
  async updatePassword(@Body() passwordDto: UpdateUserPasswordDto) {
    return await this.userService.updatePassword(passwordDto);
  }

  @Get('updatePassword/sendCaptcha')
  @ApiOperation({ summary: '发送修改密码的验证码' })
  async updatePasswordSendCaptcha(@Query('address') address: string) {
    await this.userService.updatePasswordSendCaptcha(address);
    return '验证码发送成功';
  }

  @Post('update')
  @RequireLogin()
  @ApiOperation({ summary: '更改用户信息' })
  async update(
    @GetUserInfo('userId') userId: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    await this.userService.update(userId, updateUserDto);
    return '用户信息修改成功';
  }

  @Get('update/sendCaptcha')
  @ApiBearerAuth()
  @RequireLogin()
  @ApiOperation({ summary: '发送修改用户信息的验证码' })
  async updateCaptcha(@GetUserInfo('address') address: string) {
    await this.userService.updateCaptcha(address);
    return '验证码发送成功';
  }

  @Get('freeze')
  @ApiOperation({ summary: '冻结用户' })
  async freeze(@Query('id') userId: number) {
    await this.userService.freezeUserById(userId);
    return '用户冻结成功';
  }
}
