import Image from "next/image";
import Link from "next/link";

const Logo = () => {
  return (
    <Link href="/">
      <Image src="/images/logos/xtremelogo.svg" alt="logo" width={150} height={40} />
    </Link>
  );
};

export default Logo;
