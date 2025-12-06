export const Hero = ({ title = "Default Hero" }: { title?: string }) => {
  return (
    <div className="bg-gray-900 text-white py-20 px-4 text-center">
      <h1 className="text-4xl font-bold mb-4">{title}</h1>
      <p className="text-xl text-gray-300">
        This is a shared component from the UI Bricks package.
      </p>
    </div>
  );
};
