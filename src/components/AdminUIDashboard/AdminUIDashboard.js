import axios from "axios";
import React, { useEffect, useState } from "react";
import SearchBar from "../SearchBar/SearchBar";
import UsersTable from "../UsersTable/UsersTable";
import Pagination from "../Pagination/Pagination";
import DeleteSelectedButton from "../DeleteSelectedButton/DeleteSelectedButton";
import EditModal from "../EditModal/EditModal";
import "./AdminUIDashboard.css";

const apiUrl =
  "https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json";

export default function AdminUIDashboard() {
  // states
  const [users, setUsers] = useState([]); // for fetching
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isEditingItem, setIsEditingItem] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  // variables
  const itemsPerPage = 10;
  const isAllSelected = selectedRows.length === itemsPerPage;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredData.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // functions
  async function fetchUsers() {
    try {
      const response = await axios.get(apiUrl);
      setUsers(response.data);
      setFilteredData(response.data);
      // console.log(response.data)
    } catch (error) {
      console.log(error);
    }
  }

  const handleInputSearch = (e) => {
    const query = e.target.value;
    setSearchText(query);

    const filtered = users.filter(
      (user) =>
        user.id.toLowerCase().includes(query) ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query)
    );
    console.log(filtered);
    setFilteredData(filtered);
    setCurrentPage(1); // to set page no to 1 upon search to prevent bugs
  };

  const getPageNumbers = (totalPages) => {
    const pageNumber = [];
    for (let currPage = 1; currPage <= totalPages; currPage++) {
      pageNumber.push(currPage);
    }
    return pageNumber;
  };

  const pageNumbers = getPageNumbers(totalPages);

  //   checkbox handlers
  const handleRowCheckboxChange = (event, id) => {
    const isChecked = event.target.checked;
    // if checked push into selected rows
    if (isChecked) {
      setSelectedRows([...selectedRows, id]);
    }
    // else remove it
    else {
      setSelectedRows(selectedRows.filter((item) => item !== id));
    }
  };

  const handleSelectAllRow = (event, filteredData) => {
    const isAllChecked = event.target.checked;
    if (isAllChecked) {
      const startIndex = (currentPage - 1) * itemsPerPage;
      let rowsSelected = [];
      for (let i = startIndex; i < startIndex + itemsPerPage; i++) {
        if (i < filteredData.length) {
          rowsSelected.push(filteredData[i].id);
        } else {
          rowsSelected.push(Math.random());
        }
      }
      setSelectedRows(rowsSelected);
    } else {
      setSelectedRows([]);
    }
  };

  // delete functions
  const handleDelete = (id) => {
    const updatedData = filteredData.filter((item) => item.id !== id);

    const updatedTotalPages = Math.ceil(updatedData.length / itemsPerPage);
    if (currentPage > updatedTotalPages) {
      setCurrentPage(updatedTotalPages);
    }

    setFilteredData(updatedData);
    setSelectedRows([]);
  };
  const handleDeleteAllSelected = () => {
    if (selectedRows.length === 0) return;
    const updatedData = filteredData.filter(
      (item) => !selectedRows.includes(item.id)
    );

    const updatedTotalPages = Math.ceil(updatedData.length / itemsPerPage);
    if (currentPage > updatedTotalPages) {
      setCurrentPage(updatedTotalPages);
    }

    setFilteredData(updatedData);
    setSelectedRows([]);
  };

  // editing functions

  const handleEdit = (user) => {
    setIsEditingItem(user);
    setIsEditModalOpen(true);
  };
  const handleEditSave = (editedItem) => {
    const updatedData = [...filteredData];

    const indexToBeEdited = updatedData.findIndex(
      (user) => user.id === editedItem.id
    );

    if (indexToBeEdited !== -1) {
      updatedData[indexToBeEdited] = editedItem;
      setFilteredData(updatedData);
    }
    setIsEditingItem(null);
  };
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setIsEditingItem(null);
  };

  //    pagination functions
  const handlePagination = (page) => {
    setCurrentPage(page);
    setSelectedRows([]);
  };
  // useEffects
  useEffect(() => {
    fetchUsers();
  }, []);

  //   when we move to next page while whole row selected the checkbox was checked bydefault to prevent that we use 2nd useeffect(()).
  useEffect(() => {
    setSelectedRows([]);
  }, [currentPage]);

  return (
    <div className="container">
      <SearchBar
        searchText={searchText}
        handleInputSearch={handleInputSearch}
      />
      <UsersTable
        users={currentUsers}
        handleSelectAllRow={handleSelectAllRow}
        handleRowCheckboxChange={handleRowCheckboxChange}
        filteredData={filteredData}
        selectedRows={selectedRows}
        isAllSelected={isAllSelected}
        handleDelete={handleDelete}
        handleEdit={handleEdit}
      />

      <div className="table-footer">
        <DeleteSelectedButton
          handleDeleteAllSelected={handleDeleteAllSelected}
        />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageNumbers={pageNumbers}
          handlePagination={handlePagination}
        />
      </div>

      {isEditModalOpen && (
        <EditModal
          onSave={handleEditSave}
          handleCloseEditModal={handleCloseEditModal}
          user={isEditingItem}
        />
      )}
    </div>
  );
}
