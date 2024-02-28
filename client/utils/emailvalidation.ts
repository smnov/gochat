export default function ValidateEmail(email: string): boolean {
  const emailRegex = new RegExp(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/);
  if (!emailRegex.test(email)) {
    return false
  } else {
    return true
  }

}


