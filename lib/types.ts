export interface Operator {
  id: string;
  name: string;
  email: string;
  xmppUser: string;
}

export interface Group {
  id: string;
  name: string;
  room: string;
  service: string;
}

export interface CreatedOperator extends Operator {
  initialPassword?: string;
}

export interface ApiErrorBody {
  status: number;
  code: number;
  message?: string;
  fields?: Record<string, string>;
}
