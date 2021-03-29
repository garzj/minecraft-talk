import { sign } from 'cookie-signature';

export function signObj(val: any): string {
  let signed =
    typeof val === 'object' ? 'j:' + JSON.stringify(val) : String(val);

  signed = 's:' + sign(signed, process.env.TOKEN_SECRET);

  return signed;
}
