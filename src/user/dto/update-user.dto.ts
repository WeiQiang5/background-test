import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    type: String,
    description: '头像',
    nullable: true,
  })
  headPic: string;
  @ApiProperty({
    type: String,
    description: '昵称',
    nullable: true,
  })
  nickName: string;

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
