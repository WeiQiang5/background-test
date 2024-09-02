import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterUserDto {
  @ApiProperty({
    type: String,
    description: '用户名',
    required: true,
  })
  @IsNotEmpty({ message: '用户名不能为空' })
  username: string;
  @ApiProperty({
    type: String,
    description: '昵称',
    required: true,
  })
  @IsNotEmpty({ message: '昵称不能为空' })
  nickName: string;
  @ApiProperty({
    type: String,
    description: '密码',
    required: true,
  })
  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(6, { message: '密码不能少于6位' })
  password: string;
  @ApiProperty({
    type: String,
    description: '邮箱',
    required: true,
  })
  @IsNotEmpty({ message: '邮箱不能为空' })
  @IsEmail(
    {},
    {
      message: '不是合法的邮箱格式',
    },
  )
  email: string;
  @ApiProperty({
    type: String,
    description: '验证码',
    required: true,
  })
  @IsNotEmpty({ message: '验证码不能为空' })
  captcha: string;
}
