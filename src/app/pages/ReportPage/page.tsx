'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import './globals.css';
import axios from 'axios';
import { Grid, Card, CardContent, Typography, Divider, Box, Button, Pagination } from '@mui/material';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const instance = axios.create({
    baseURL: 'https://mtlda2oa5d.execute-api.us-east-2.amazonaws.com/Test',
});

export interface Item {
    PurchaseID: number;
    ItemID: number;
    Name: string
    Description: string;
    Images: string[];
    PurchasePrice: number;
    AuctionHouseProfit: string;
    BuyerName: string;
    BuyerID: number;
    BidTime: string;
    HighestBidAmount: number,
    ParticipantsList: ParticipantsList[],
    InitialPrice: number;

}
export interface ParticipantsList {
    ItemID: number;
    BuyerID: number;
    BuyerName: string;
    TotalBids: number;
    MaxBidAmount: number;
    BidTimeStamp: string;
}


export default function ReportPage() {
    const [auctionReport, setAuctionReport] = useState<Item[]>([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const itemsPerPage = 5;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = auctionReport.slice(startIndex, startIndex + itemsPerPage);
    const router = useRouter();
    useEffect(() => {

        handleItemDetail();
    }, []);

    const handleItemDetail = () => {

        try {
            setLoading(true);
            instance.post('/admin/getauctionreport')
                .then((response) => {
                    if (response.data) {
                        console.log('Response:', response.data);
                        

                        setAuctionReport(response.data);
                    }
                    setLoading(false);
                })
                .catch((error) => {
                    console.log(error);
                    setErrorMessage('Failed to load auction report.');
                    setLoading(false);
                })
        }
        catch (error) {
            setErrorMessage('Failed to load auction report');
            setLoading(false);
        } finally {
            setLoading(false);
        }

    }

    const downloadAuctionReportPDF = (auctionReport: Item[]) => {
        try {
            const doc = new jsPDF();


            doc.setFontSize(16);
            doc.text('Auction Report', 14, 15);

            let currentY = 25;

            auctionReport.forEach((item, index) => {

                if (currentY + 60 > doc.internal.pageSize.height) {
                    doc.addPage();
                    currentY = 15;
                }

                const { Name, Description, PurchasePrice, AuctionHouseProfit, InitialPrice, BuyerName, ParticipantsList } = item;


                doc.setFontSize(12);
                doc.text(`Item ${index + 1}: ${Name}`, 14, currentY);
                doc.setFontSize(10);
                doc.text(`Description: ${Description}`, 14, currentY + 8);
                doc.text(`Initial Price: $${InitialPrice}`, 14, currentY + 16);
                doc.text(`Purchase Price: $${PurchasePrice}`, 14, currentY + 24);
                doc.text(`Auction House Profit: $${AuctionHouseProfit}`, 14, currentY + 32);
                doc.text(`Buyer: ${BuyerName}`, 14, currentY + 40);

                currentY += 48;


                if (ParticipantsList && ParticipantsList.length > 0) {

                    if (currentY + 30 > doc.internal.pageSize.height) {
                        doc.addPage();
                        currentY = 15;
                    }

                    autoTable(doc, {
                        startY: currentY,
                        head: [['Buyer Name', 'Total Bids', 'Max Bid Amount', 'Bid Timestamp']],
                        body: ParticipantsList.map(participant => [
                            participant.BuyerName,
                            participant.TotalBids.toString(),
                            `$${participant.MaxBidAmount.toFixed(2)}`,
                            new Date(participant.BidTimeStamp).toLocaleString(),
                        ]),
                        styles: { fontSize: 8 },
                        margin: { left: 14 },
                    });


                    const rowsHeight = ParticipantsList.length * 10;
                    currentY += rowsHeight + 20;
                }
            });

            // Save the PDF
            doc.save('Auction_Report.pdf');
            console.log('PDF generated successfully!');
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
    };


    const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
        setCurrentPage(page);
    };


    return (
        <div style={{ padding: '20px' }}>

            <div> <button className='pdf-button' type="button" onClick={() => router.push('/pages/AdminPage')}>Go to Admin Page</button></div>

            <Typography variant="h4" gutterBottom>
                Auction Report
            </Typography>

            {errorMessage && (
                <Typography color="error" variant="body1">
                    {errorMessage}
                </Typography>
            )}

            <button className='pdf-button'
                onClick={() => downloadAuctionReportPDF(auctionReport)} disabled={auctionReport.length === 0}>
                Download Auction Report
            </button>

            {loading && (
                <div className="loader">
                    <div className="spinner"></div>
                </div>
            )}

            <Grid container spacing={2} sx={{ padding: 2 }}>
                {currentItems.map((item, index) => (
                    <Grid item xs={12} md={6} key={index}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">{item.Name}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {item.Description}
                                </Typography>
                                <Divider sx={{ margin: "10px 0" }} />

                                <Box>
                                    <Typography variant="subtitle2">
                                        InitialPrice: ${item.InitialPrice}
                                    </Typography>
                                    <Typography variant="subtitle2">
                                        Auction House Profit: ${item.AuctionHouseProfit}
                                    </Typography>
                                    <Typography variant="subtitle2">
                                        Buyer: {item.BuyerName}
                                    </Typography>
                                    <Typography variant="subtitle2">
                                        Highest Bid Amount: ${item.HighestBidAmount}
                                    </Typography>
                                </Box>
                                <Divider sx={{ margin: "10px 0" }} />

                                <Typography variant="subtitle1">Participants:</Typography>
                                <Box>
                                    {item.ParticipantsList.map((participant, pIndex) => (
                                        <Typography key={pIndex} variant="body2">
                                            - {participant.BuyerName} (<strong>Number of Bids: </strong>
                                            {participant.TotalBids}, <strong>Max Bid $  </strong>
                                            {participant.MaxBidAmount},<strong>Bid TimeStamp : </strong>
                                            {participant.BidTimeStamp})
                                        </Typography>
                                    ))}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Pagination */}
            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
                <Pagination
                    count={Math.ceil(auctionReport.length / itemsPerPage)}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                />
            </Box>


        </div>
    );

}


