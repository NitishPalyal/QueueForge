import type { JwtPayload } from "jsonwebtoken";

export interface RegisterControllerBody {
  email: string;
  password: string;
  fullname: string;
}

export interface LoginControllerBody {
  email: string;
  password: string;
}

export interface ComparePasswordServiceParam {
  password: string;
  hashedPassword: string;
}

export interface JwtPayloadWithId extends JwtPayload {
  id: string;
}

export interface findUserByEmailAndFullnameServiceParam {
  email: string;
  fullname: string;
}
