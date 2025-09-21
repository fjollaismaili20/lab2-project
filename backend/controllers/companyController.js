// controllers/companyController.js
import { pool, companyQueries } from '../database/postgresSchemas.js';

// Merr të gjitha kompanitë
export const getCompanies = async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(companyQueries.findAll);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
};

// Krijo një kompani të re
export const createCompany = async (req, res) => {
  const { CompanyID, CompanyName, Address, Description } = req.body;

  const client = await pool.connect();
  try {
    const result = await client.query(companyQueries.insert, [
      CompanyID, CompanyName, Address, Description
    ]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
};

// Fshi një kompani
export const deleteCompany = async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(companyQueries.delete, [req.params.id]);
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error deleting company:', error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
};

// Edito një kompani
export const updateCompany = async (req, res) => {
  const { CompanyID, CompanyName, Address, Description } = req.body;
  const client = await pool.connect();
  try {
    const result = await client.query(companyQueries.update, [
      CompanyID, CompanyName, Address, Description, req.params.id
    ]);
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating company:', error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
};
