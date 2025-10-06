import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'dev-secret',
    });
  }

  async validate(payload: any) {
    console.log('JWT Strategy - Payload received:', payload);
    const user = { id: payload.sub, sub: payload.sub, email: payload.email, role: payload.role };
    console.log('JWT Strategy - User object created:', user);
    return user;
  }
}
