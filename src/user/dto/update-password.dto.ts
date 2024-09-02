import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class UpdateUserPasswordDto {
  @ApiProperty({
    type: String,
    description: '密码',
    required: true,
  })
  @IsNotEmpty({
    message: '密码不能为空',
  })
  @MinLength(6, {
    message: '密码不能少于 6 位',
  })
  password: string;

  @ApiProperty({
    type: String,
    description: '邮箱',
    required: true,
  })
  @IsNotEmpty({
    message: '邮箱不能为空',
  })
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
  @IsNotEmpty({
    message: '验证码不能为空',
  })
  captcha: string;
}
