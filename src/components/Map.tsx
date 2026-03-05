
// center somewhere near the Volve oil field in the North Sea
const DEFAULT_POSITION: [number, number] = [57.3, 4.9];

export default function MapView() {
  const handleOpenWindow = () => {
    window.open('https://factmaps.sodir.no/factmaps/', 'SODIR Factmaps', 'width=1200,height=800');
  };

  return (
    <div className="h-full w-full flex items-center justify-center">
      <button
        onClick={handleOpenWindow}
        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition"
      >
        Open SODIR Factmaps in New Window
      </button>
    </div>
  );
}
