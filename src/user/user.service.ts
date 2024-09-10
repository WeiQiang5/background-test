import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Like, Repository } from 'typeorm';
import { RegisterUserDto } from './dto/register-user.dto';
import { RedisService } from 'src/redis/redis.service';
import { md5 } from 'src/utils';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { LoginUserDto } from './dto/login-user.dto';
import { LoginUserVo, ReturnUser } from './vo/login-user.vo';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserDetailVo } from './vo/user-details.vo';
import { UpdateUserPasswordDto } from './dto/update-password.dto';
import { EmailService } from 'src/email/email.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from 'src/utils/req-list-query';
import { ListUserDto } from './dto/list-user.dto';

interface EmailCaptcha {
  prefix: string;
  address: string;
  subject: string;
  html: string;
  time?: number;
  code: string;
}

@Injectable()
export class UserService {
  private logger = new Logger();

  @Inject(RedisService)
  private redisService: RedisService;
  @Inject(ConfigService)
  private configService: ConfigService;
  @Inject(JwtService)
  private jwtService: JwtService;
  @Inject(EmailService)
  private emailService: EmailService;

  @InjectRepository(User)
  private userRepository: Repository<User>;
  @InjectRepository(Role)
  private roleRepository: Repository<Role>;
  @InjectRepository(Permission)
  private permissionRepository: Repository<Permission>;

  // 获取token值
  getToken(user: ReturnUser): {
    access_token: string;
    refresh_token: string;
  } {
    console.log('user', user);
    const access_token = this.jwtService.sign(
      {
        userId: user.id,
        username: user.username,
        email: user.email,
        roles: user.roles,
        permissions: user.permissions,
      },
      {
        expiresIn:
          this.configService.get('JWT_ACCESS_TOKEN_EXPIRES_TIME') ?? '30m',
      },
    );
    const refresh_token = this.jwtService.sign(
      {
        userId: user.id,
      },
      {
        expiresIn:
          this.configService.get('JWT_REFRESH_TOKEN_EXPIRES_TIME') ?? '7d',
      },
    );
    return {
      access_token,
      refresh_token,
    };
  }

  async findUserById(userId: number): Promise<ReturnUser> {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
      relations: ['roles', 'roles.permissions'],
    });

    return {
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
      email: user.email,
      roles: user.roles.map((role) => role.name),
      permissions: user.roles.reduce((arr, item) => {
        item.permissions.forEach((permission) => {
          if (arr.indexOf(permission) === -1) {
            arr.push(permission);
          }
        });
        return arr;
      }, []),
    };
  }

  async findUserDetailById(userId: number): Promise<UserDetailVo> {
    const foundUser = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });
    return foundUser;
  }

  async register(user: RegisterUserDto) {
    const captcha = await this.redisService.get(`captcha_${user.email}`);
    console.log('验证码=>', captcha);

    if (!captcha) {
      throw new HttpException('验证码已失效', HttpStatus.BAD_REQUEST);
    }

    if (user.captcha !== captcha) {
      throw new HttpException('验证码不正确', HttpStatus.BAD_REQUEST);
    }

    const foundUser = await this.userRepository.findOneBy({
      username: user.username,
    });

    if (foundUser) {
      throw new HttpException('用户已存在', HttpStatus.BAD_REQUEST);
    }
    console.log('user=>', User);

    const newUser = new User();
    newUser.username = user.username;
    newUser.password = md5(user.password);
    newUser.email = user.email;
    newUser.nickName = user.nickName;

    try {
      await this.userRepository.save(newUser);
      return '注册成功';
    } catch (e) {
      this.logger.error(e, UserService);
      return '注册失败';
    }
  }

  async login(loginUserDto: LoginUserDto): Promise<LoginUserVo> {
    const foundUser = await this.userRepository.findOne({
      where: {
        username: loginUserDto.username,
      },
      relations: ['roles', 'roles.permissions'],
    });
    if (!foundUser) {
      throw new HttpException('该用户不存在，请注册', HttpStatus.BAD_REQUEST);
    }
    if (foundUser.password !== md5(loginUserDto.password)) {
      throw new HttpException('密码不正确，请重新登录', HttpStatus.BAD_REQUEST);
    }
    delete foundUser.password;

    const vo = new LoginUserVo();
    vo.userInfo = {
      id: foundUser.id,
      username: foundUser.username,
      nickName: foundUser.nickName,
      email: foundUser.email,
      phoneNumber: foundUser.phoneNumber,
      headPic: foundUser.headPic,
      createTime: foundUser.createTime,
      isFrozen: foundUser.isFrozen,
      isAdmin: foundUser.isAdmin,
      roles: foundUser.roles.map((item) => item.name),
      permissions: foundUser.roles.reduce((arr, item) => {
        item.permissions.forEach((permission) => {
          if (arr.indexOf(permission) === -1) {
            arr.push(permission);
          }
        });
        return arr;
      }, []),
    };

    const { access_token, refresh_token } = this.getToken({
      id: vo.userInfo.id,
      username: vo.userInfo.username,
      email: vo.userInfo.email,
      roles: vo.userInfo.roles,
      permissions: vo.userInfo.permissions,
      isAdmin: vo.userInfo.isAdmin,
    });

    vo.accessToken = access_token;
    vo.refreshToken = refresh_token;
    return vo;
  }

  async updatePassword(passwordDto: UpdateUserPasswordDto) {
    const captcha = await this.redisService.get(
      `update_password_captcha_${passwordDto.email}`,
    );

    if (!captcha) {
      throw new HttpException('验证码不存在', HttpStatus.BAD_REQUEST);
    }

    if (passwordDto.captcha !== captcha) {
      throw new HttpException('验证码不正确', HttpStatus.BAD_REQUEST);
    }

    const foundUser = await this.userRepository.findOne({
      where: {
        username: passwordDto.username,
      },
    });

    foundUser.password = md5(passwordDto.password);

    try {
      await this.userRepository.save(foundUser);
      return '密码修改成功';
    } catch (e) {
      this.logger.error(e, UserService);
      return '密码修改失败';
    }
  }

  async update(userId: number, updateUserDto: UpdateUserDto) {
    const captcha = await this.redisService.get(
      `update_user_captcha_${updateUserDto.email}`,
    );

    if (!captcha) {
      throw new HttpException('验证码已失效', HttpStatus.BAD_REQUEST);
    }

    if (updateUserDto.captcha !== captcha) {
      throw new HttpException('验证码不正确', HttpStatus.BAD_REQUEST);
    }

    const foundUser = await this.userRepository.findOneBy({
      id: userId,
    });

    if (updateUserDto.nickName) {
      foundUser.nickName = updateUserDto.nickName;
    }

    if (updateUserDto.headPic) {
      foundUser.headPic = updateUserDto.headPic;
    }

    try {
      await this.userRepository.save(foundUser);
      return '用户信息修改成功';
    } catch (e) {
      this.logger.error(e, UserService);
      return '用户信息修改完成';
    }
  }
  async freezeUserById(userId: number) {
    const user = await this.userRepository.findOneBy({
      id: userId,
    });

    user.isFrozen = true;

    await this.userRepository.save(user);
  }
  async findUsersByPage(query: ListUserDto) {
    const { username, nickName, email, pageNo, pageSize } = query;
    const skipCount = (pageNo - 1) * pageSize;

    const condition: Record<string, any> = {};
    if (username && username.trim() !== '') {
      condition.username = Like(`%${username}%`);
    }
    if (nickName && nickName.trim() !== '') {
      condition.nickName = Like(`%${nickName}%`);
    }
    if (email && email.trim() !== '') {
      condition.email = Like(`%${email}%`);
    }

    console.log('skipCount=>', skipCount, pageNo, pageSize);
    const [users, totalCount] = await this.userRepository.findAndCount({
      select: [
        'id',
        'username',
        'nickName',
        'email',
        'phoneNumber',
        'isFrozen',
        'headPic',
        'createTime',
      ],
      skip: skipCount,
      take: pageSize,
      where: Object.keys(condition).length > 0 ? condition : null,
    });

    return {
      list: users,
      total: totalCount,
    };
  }
  // 发送邮件
  async commonSendCaptcha(params: EmailCaptcha) {
    const { prefix, address, subject, html, time, code } = params;
    await this.redisService.set(`${prefix}${address}`, code, time ?? 10 * 60);

    await this.emailService.sendMail({
      to: address,
      subject,
      html,
    });
    return '发送成功';
  }
  async updatePasswordSendCaptcha(address: string) {
    const code = Math.random().toString().slice(2, 8);
    await this.commonSendCaptcha({
      prefix: 'update_password_captcha_',
      address,
      subject: '更改密码验证码',
      html: `<p>你的更改密码验证码是${code}</p>`,
      code,
    });
  }
  async updateCaptcha(email: string) {
    const code = Math.random().toString().slice(2, 8);
    await this.commonSendCaptcha({
      prefix: 'update_user_captcha_',
      address: email,
      subject: '更改用户信息验证码',
      html: `<p>你的验证码是 ${code}</p>`,
      code,
    });
  }
}
