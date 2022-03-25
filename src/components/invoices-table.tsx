import React, { useEffect, useState } from "react";
import { DataGrid, GridColDef, GridRowsProp } from "@mui/x-data-grid";
import axios from "axios";
import styled from "styled-components";
import * as CurrencyFormat from 'react-currency-format';
import { CircularProgress, SelectChangeEvent, TextField } from "@mui/material";
import DatePicker from "@mui/lab/DatePicker";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Button from "@material-ui/core/Button";

interface TableInfo {
    rows: GridRowsProp;
    columns: GridColDef[];
    loading: boolean
};

const InvoiceContainer = styled.div`
    text-align: center;
`;

const FilterContainer = styled.div`
    margin: 10px 0 10px 0;
    display: flex;
    justify-content: space-evenly;
`;

const TableContainer = styled.div`
    height: 375px;
    margin: 10px 0 10px 0;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const currenciesList = [
    {
        id: 1,
        description: 'United States Dollar',
        abbreviation: 'USD',
        symbol: '$'
    },
    {
        id: 2,
        description: 'Chilean Peso',
        abbreviation: 'CLP',
        symbol: '$'
    },
    {
        id: 3,
        description: 'Euro',
        abbreviation: 'EUR',
        symbol: '€'
    }
];

export function InvoicesTable(props) {
    const client = props.client;

    const [tableInfo, setTableInfo] = useState<TableInfo>({ rows: [], columns: [], loading: true});
    const [pageSize, setPageSize] = useState(5);
    const [fromDate, setFromDate] = useState<Date | null>(null);
    const [toDate, setToDate] = useState<Date | null>(null);
    const [vendorId, setVendorId] = useState<number>(0);
    const [currencyId, setCurrencyId] = useState<number>(client.currency.id);

    let currencySelected = client.currency;

    useEffect(() => {
        if (tableInfo.loading === true) {
            getData();
        }
    }, []);

    const getData = async () => {
        setTableInfo({ rows: tableInfo.rows, columns: tableInfo.columns,  loading: true });

        let params = {}
        if (vendorId !== 0) params['vendorId'] = vendorId;
        if (fromDate) params['invoiceDateStart'] = fromDate;
        if (toDate) params['invoiceDateEnd'] = toDate;

        const config = {
            params: params,
            headers: {
                clientcurrencyid: client.currency.id,
            }
        };

        axios
        .get(`http://localhost:3000/invoices/list${currencyId !== 0 ? `/${currencyId}` : ''}`, config)
        .then((response: any) => {
            const rows: GridRowsProp = response.data.result;
            const columns: GridColDef[] = [
                { field: "invoiceNumber", headerName: "Núm. factura", flex: 1 },
                { field: "invoiceId", headerName: "Id de factura", flex: 1 },
                { field: "vendorId", headerName: "Id proveedor", flex: 1 },
                { field: "bankId", headerName: "Id de Banco", flex: 1 },
                { field: "invoiceTotal", headerName: "TOTAL factura", flex: 1, renderCell: (params) => moneyFormatter(params.value) },
                { field: "creditTotal", headerName: "Credito TOTAL", flex: 1, renderCell: (params) => moneyFormatter(params.value) },
                { field: "paymentTotal", headerName: "TOTAL pagos", flex: 1, renderCell: (params) => moneyFormatter(params.value) },
            ];

            if (currencyId !== 0) {
                currencySelected = currenciesList.find(curr => curr.id === currencyId);
            }

            setTableInfo({ rows: rows, columns: columns, loading: false });
        
        }, error => {
            console.log(error)
            alert(error)
        });
    }

   const moneyFormatter = (ammount) => {
        return(
            <CurrencyFormat
                value={ ammount }
                displayType={ 'text' }
                thousandSeparator={ true }
                prefix={ `${currencySelected.abbreviation} ${currencySelected.symbol}` }
                decimalScale={ 2 }
                fixedDecimalScale={ true }
            />
        );
    };

    const handleChange = (event) => {
        setVendorId(parseInt(event.target.value,10));
    };

    const handleCurrencyChange = (event) => {
        setCurrencyId(parseInt(event.target.value,10));
    };

    return (
        <InvoiceContainer>
            <h1>Listado de facturas</h1>
            <FilterContainer>
                <FormControl>
                    <InputLabel id="vendor-select-label">Proveedor</InputLabel>
                    <Select
                        labelId="vendor-select-label"
                        id="vendor-select"
                        value={vendorId}
                        label="Proveedor"
                        onChange={handleChange}
                        autoWidth
                    >
                        <MenuItem value={0}>Seleccione proveedor</MenuItem>
                        <MenuItem value={34}>Treinta y cuatro</MenuItem>
                        <MenuItem value={37}>Treinta y siete</MenuItem>
                        <MenuItem value={119}>Ciento diecinueve</MenuItem>
                        <MenuItem value={122}>Ciento veintidós</MenuItem>
                    </Select>
                </FormControl>
                <DatePicker
                    label="Fecha desde"
                    value={fromDate}
                    inputFormat="dd/MM/yyyy"
                    onChange={(newValue) => {
                        setFromDate(newValue);
                    }}
                    renderInput={(params) => <TextField {...params} />}
                />
                <DatePicker
                    label="Fecha hasta"
                    value={toDate}
                    inputFormat="dd/MM/yyyy"
                    onChange={(newValue) => {
                        setToDate(newValue);
                        console.log(newValue)
                    }}
                    renderInput={(params) => <TextField {...params} />}
                />
                <FormControl>
                    <InputLabel id="currency-select-label">Ver en moneda</InputLabel>
                    <Select
                        labelId="currency-select-label"
                        id="currency-select"
                        value={currencyId}
                        label="Ver en moneda"
                        onChange={handleCurrencyChange}
                        autoWidth
                    >
                        <MenuItem value={1}>Dolar Estadounidense</MenuItem>
                        <MenuItem value={2}>Peso Chileno</MenuItem>
                        <MenuItem value={3}>Euro</MenuItem>
                    </Select>
                </FormControl>
            </FilterContainer>
            <Button
                variant="contained"
                onClick={() => {
                    getData();
                }}
            >
                Filtrar
            </Button>
            <TableContainer>
                { tableInfo.loading ? (
                    <CircularProgress />
                    ) : (
                    <DataGrid
                        rows={ tableInfo.rows }
                        columns={ tableInfo.columns }
                        pageSize={ pageSize }
                        rowsPerPageOptions={ [5, 10, 20] }
                        onPageSizeChange={ (size) => setPageSize(size) }
                        getRowId={ row => row.invoiceId }
                    />)
                }
            </TableContainer>
        </InvoiceContainer>
    );
}
