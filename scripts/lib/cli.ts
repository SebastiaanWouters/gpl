export function parseEnumFlag<T extends string>(
  args: string[],
  flag: string,
  allowed: readonly T[]
): T | undefined {
  const index = args.indexOf(flag);
  if (index < 0) {
    return undefined;
  }

  const value = args[index + 1];
  if (!value) {
    console.error(`ERROR: missing value for ${flag}; expected one of: ${allowed.join(", ")}`);
    process.exit(1);
  }

  if (!allowed.includes(value as T)) {
    console.error(`ERROR: invalid value for ${flag}: ${value}; expected one of: ${allowed.join(", ")}`);
    process.exit(1);
  }

  return value as T;
}
