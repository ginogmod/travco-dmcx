import React, { createContext, useState, useContext, useEffect } from 'react';
import Papa from 'papaparse';

const PointsContext = createContext(null);

export const PointsProvider = ({ children }) => {
    const [agencies, setAgencies] = useState([]);
    const [tiers, setTiers] = useState([
        { name: 'Bronze', range: '0-999 pts', benefits: 'Standard support' },
        { name: 'Silver', range: '1,000-4,999 pts', benefits: 'Priority support' },
        { name: 'Gold', range: '5,000-9,999 pts', benefits: 'Dedicated account manager' },
        { name: 'Platinum', range: '10,000+ pts', benefits: 'Exclusive event invitations' },
    ]);

    useEffect(() => {
        const fetchAndParseData = async () => {
            try {
                const response = await fetch('/data/All Accounts.csv');
                if (!response.ok) {
                    throw new Error('Failed to fetch CSV file.');
                }
                const csvText = await response.text();

                Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        const formattedAgencies = results.data
                            .filter(row => row['Account Name'] && row['Account Name'].trim())
                            .map((row, index) => ({
                                id: `A${String(index + 1).padStart(3, '0')}`,
                                name: row['Account Name'].trim(),
                                points: 0,
                                tier: 'Bronze',
                                history: [],
                            }));
                        setAgencies(formattedAgencies);
                    }
                });
            } catch (error) {
                console.error("Error processing CSV file:", error);
            }
        };

        fetchAndParseData();
    }, []);

    const addPoints = (agencyId, pointsToAdd, reason) => {
        setAgencies(prevAgencies => {
            const updatedAgencies = prevAgencies.map(agency => {
                if (agency.id === agencyId) {
                    const newPoints = agency.points + pointsToAdd;
                    const newHistory = [...agency.history, { date: new Date().toISOString().split('T')[0], activity: reason, points: pointsToAdd }];
                    
                    // Determine the new tier
                    let newTier = 'Bronze';
                    if (newPoints >= 10000) newTier = 'Platinum';
                    else if (newPoints >= 5000) newTier = 'Gold';
                    else if (newPoints >= 1000) newTier = 'Silver';

                    return { ...agency, points: newPoints, tier: newTier, history: newHistory };
                }
                return agency;
            });
            return updatedAgencies;
        });
    };
    
    const value = {
        agencies,
        tiers,
        addPoints,
        setTiers,
    };

    return (
        <PointsContext.Provider value={value}>
            {children}
        </PointsContext.Provider>
    );
};

export const usePoints = () => {
    const context = useContext(PointsContext);
    if (!context) {
        throw new Error('usePoints must be used within a PointsProvider');
    }
    return context;
};