import { PaintTimer, RandomPicker, ShoppingList, CsvImport, ShareCollection, Glossary } from '../components/Tools';

export default function Tools() {
  return (
    <div>
      <div className="page-header" style={{ paddingTop: 48 }}>
        <h2>🧰 Tools</h2>
      </div>
      <div className="tools-grid">
        <PaintTimer />
        <RandomPicker />
        <ShoppingList />
        <ShareCollection />
        <CsvImport />
        <Glossary />
      </div>
    </div>
  );
}
