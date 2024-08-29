import { Container } from 'lucide-react';

export const NoContainerLayout = () => {
  return (
    <div className="h-[150px] flex flex-col justify-center items-center space-y-5 ">
      <Container width={36} height={36} />
      <span className="text-xl">No container selected</span>
    </div>
  );
};
