import './App.css';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import { InvoicesTable } from "./components/invoices-table";


const client = {
  currency: {
    id: 2,
    description: 'Chilean Peso',
    abbreviation: 'CLP',
    symbol: '$'
  },
};

function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div className="App">
        <InvoicesTable client={client}></InvoicesTable>
      </div>
    </LocalizationProvider>
  );
}

export default App;
