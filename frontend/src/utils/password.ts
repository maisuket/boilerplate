export function generateRandomPassword(length = 12): string {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const specials = "!@#$%^&*()_+~`|}{[]:;?><,./-=";

  let generated = "";
  generated += uppercase[Math.floor(Math.random() * uppercase.length)];
  generated += lowercase[Math.floor(Math.random() * lowercase.length)];
  generated += numbers[Math.floor(Math.random() * numbers.length)];
  generated += specials[Math.floor(Math.random() * specials.length)];

  const allChars = uppercase + lowercase + numbers + specials;
  for (let i = generated.length; i < length; i++) {
    generated += allChars[Math.floor(Math.random() * allChars.length)];
  }

  return generated
    .split("")
    .sort(() => 0.5 - Math.random())
    .join("");
}

export function getPasswordStrength(password: string): number {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  return strength;
}

export function getPasswordStrengthLabel(strength: number): string {
  switch (strength) {
    case 0:
    case 1:
      return "Weak password";
    case 2:
      return "Fair password";
    case 3:
      return "Good password";
    case 4:
      return "Strong password";
    default:
      return "";
  }
}
