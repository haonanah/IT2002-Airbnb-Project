import React, { useEffect, useState } from "react"
import FieldRowView from "./FieldRowView"
import * as api from '../api'
import { RelationView } from "../pages/Admin"
import TableView from "./TableView"

// ? A custom `type` in TypeScript - defining a map (just as Python dictionaries), whose keys and values are both strings
export type StringMap = { [dtype: string]: string }


// ? Another interface (type) for the exchanged field/row in the relation
interface FieldRow {
    id: number
    // ? field name and type are dynamic in this case, allowing you to freely chose what you want to design
    fieldName: string
    fieldType: string
}

// ? The necessary interface to define the type of the props of the EditView element 
interface EditViewProps {
    // ? Takes RelationView from the parent to interactively modify
    relationView: RelationView
    // ? Used to call the parent component (App in this case) every time something is updated to view it on the right side
    onRelationChange: (relationView: RelationView) => void
    onDeleteTable: () => void;
    setSearchString: (relationView: Array<{ [key: string]: any }>) => void
}

export const DataTypes: StringMap = {
    'boolean': 'BOOL',
    'integer': 'INT',
    'text': 'TEXT',
    'time': 'TIME',
}

// ? Definition of the component EditView - note that the const `EditView` is a function definiton and it is recognized as an object in runtime
const AdminView = (props: EditViewProps) => {
    // ? 4 primitive data types used in definition. Note that all of them are sent to back as strings. You may try to write error-tolerant code in the backend to store them in respective PostgreSQL types
    // ! You will have to add more data types as needed in your table definitions following the below pattern


    // ? A JavaScript way of taking the keys of the above StringMap. It will return the list ['boolean','integer',...]
    const fieldTypes = Object.keys(DataTypes)

    // ? A boolean STATE VARIABLE used to show/hide the user definition (left) and table view (right) windows 
    const [showDefinitionField, setShowDefinitionField] = useState<boolean>(true)

    const [priceFilter, setPriceFilter] = useState<string>('')


    // ? Is a state variable - an array of FieldRow objects, used to store the added data fields one by one by the user during relation definition
    const [fieldRows, setFieldRows] = useState<Array<FieldRow>>([
        {
            id: 0,
            fieldName: "id",
            fieldType: fieldTypes[1],
        },
        {
            id: 1,
            fieldName: "name",
            fieldType: fieldTypes[2],
        },
        {
            id: 2,
            fieldName: "host_id",
            fieldType: fieldTypes[1],
        }, {
            id: 3,
            fieldName: "host_name",
            fieldType: fieldTypes[2],
        }
        , {
            id: 4,
            fieldName: "neighbourhood",
            fieldType: fieldTypes[2],
        },
        {
            id: 5,
            fieldName: "room_type",
            fieldType: fieldTypes[2],
        },
        {
            id: 6,
            fieldName: "price",
            fieldType: fieldTypes[1],
        },
        {
            id: 7,
            fieldName: "availability",
            fieldType: fieldTypes[1],
        }
    ])

    // ? A state variable to store the typed value into the relation name field
    const [relationName, setRelationName] = useState<string>("")
    // ? First it might seem difficult to understand, imagine it this way:
    // ? After you create a relation, you will receive a table view on the right and one of the fields on the left will change
    // ? One of them will allow you to insert values into the responding fields. insertionValues is a StringMap storing those values-to-insert until you press the insert button
    const [insertionValues, setInsertionValues] = useState<StringMap>({})
    // ? The same as above, the StringMap below stores the values for rows to update, and has just one additional parameter, id, to refer to a specific entry
    const [updateValues, setUpdateValues] = useState<StringMap>({})
    // ? ID of the entry/row to be deleted from the relation
    const [deletionId, setDeletionId] = useState<number>(-1)
    const [hasRelation, setHasRelation] = useState<boolean>(false)

    const [searchString, setSearchString] = useState<string>('')
    const [currentRelationName] = useState<string>('airbnb');

    const getSearchResults = async () => { //awaits result of call to an serachEntry API which takes in serach string and result is returned as any[]
        const result = await api.searchEntry({
            searchString: searchString
        }) as any[];
        props.setSearchString(result.map(row => ({ //maps the arry of results to the given properties 
            id: row[0],
            name: row[1],
            host_id: row[2],
            host_name: row[3],
            neighbourhood: row[4],
            room_type: row[5],
            price: row[6],
            availability: row[7]
        })))
        //console.log(result)
        //props.setSearchResults()
    }

    // useEffect(() => {
    //     console.log(props.relationView.columns.length === 0)
    //     setHasRelation(!(props.relationView.columns.length === 0))
    // }, [])
    return (
        // ? sub-view is the style class used to separate 2 main views - editing and table view
        <div id="sub-view" style={{ display: 'flex', flexDirection: 'column' }}>
            {/* <div className="relation-definition">
                <p>Define your relation here:</p>
                <div className="relation-name">
                    <p>Relation name:&nbsp;</p>
                  
                    <input type="text" value={relationName} onChange={handleRelationNameChange} />
                </div>

                <div className="field-rows">
                    {
                        // ? Map method returns an array of components in this case. You can see that each fieldRow element inside the fieldRows state variable is uniquely represented by an id
                        // ? Refer to each method for onField... to know more about what they do
                        fieldRows.map(fieldRow => (
                            <FieldRowView
                                // ? Below 3 field are for the 3 characteristics of the field definition
                                id={fieldRow.id}
                                fieldName={fieldRow.fieldName}
                                fieldType={fieldRow.fieldType}
                                onFieldNameEdit={handleFieldNameEdit}
                                onFieldTypeEdit={handleFieldTypeEdit}
                                onFieldAddition={handleFieldRowAddition}
                                onFieldDeletion={handleFieldRowDeletion}
                                // ? Prevents showing the delete button if there are less than 2 elements to display
                                showDelete={fieldRows.length > 1}
                                dataTypes={fieldTypes}
                                key={fieldRow.id}
                            />
                        ))
                    }
                </div>
                <div className="create-relation-button">
                    <button onClick={hanldeRelationCreation}>Create Relation</button>
                </div>
            </div> */}

            {
                props.relationView.columns.length > 0 && (
                    <div className="relation-edition">
                        <div className="column" style={{ margin: 20 }}>
                            <p>Do your search here:</p>
                            <div className="row">
                                <input type="text" value={searchString} onChange={(e) => setSearchString(e.target.value)} />
                                <button onClick={getSearchResults}>Search</button>
                            </div>
                        </div>

                        <div className="column" style={{ margin: 20 }}>
                            <p>Filter by price here (&#60;)</p>
                            <div className="row">
                                <input type="text" value={priceFilter} onChange={(e) => setPriceFilter(e.target.value)} />
                                <button onClick={getFilteredTable}>Search</button>
                            </div>
                        </div>
                        <TableView relationView={props.relationView} />
                        <div className="value-insertion">
                            <p>Use the below fields to insert an entry:</p>
                            {
                                props.relationView.columns.map(col => {
                                    if (col !== "id") {
                                        return (
                                            <div className="row-value" key={col}>
                                                <p>{col}:&nbsp;</p>
                                                <input
                                                    type="text"
                                                    value={insertionValues[col]}
                                                    onChange={(event) => {
                                                        handleInsertionValueEdit(event, col)
                                                    }}
                                                />
                                            </div>
                                        )
                                    }
                                })
                            }
                            <button onClick={handleEntryInsertion}>Insert Entry</button>
                        </div>
                        <div className="value-modification">
                            <p>Use the below fields to modify an existing entry:</p>
                            {
                                props.relationView.columns.map(col => {
                                    return (
                                        <div className="row-value" key={col}>
                                            <p>{col}:&nbsp;</p>
                                            <input
                                                type="text"
                                                value={updateValues[col]}
                                                onChange={(event) => {
                                                    handleUpdateValueEdit(event, col)
                                                }}
                                            />
                                        </div>
                                    )
                                })
                            }
                            <button onClick={handleEntryUpdate}>Update Entry</button>
                        </div>
                        <div className="value-deletion">
                            <p>Insert the row id to be removed from the relation: </p>
                            <div>
                                <input type="text" value={deletionId === -1 ? "" : deletionId.toString()} onChange={(event) => {
                                    handleDeleteValueEdit(event)
                                }} />
                                <button onClick={handleEntryDeletion}>Remove</button>
                            </div>
                        </div>

                        <button onClick={handleDeletedTable}>Delete table</button>
                    </div>
                )}

        </div>
    )


    function handleFieldRowAddition(id: number) { //take in id, find index of object in array given id before adding through splice
        let _fieldRows = [...fieldRows]
        let idx = _fieldRows.findIndex(fieldRow => fieldRow.id === id)
        let newId = _fieldRows.length + 1
        let newRow: FieldRow = {
            fieldName: "",
            fieldType: fieldTypes[0],
            id: newId
        }
        _fieldRows.splice(idx + 1, 0, newRow)
        setFieldRows(_fieldRows)
    }


    function handleFieldRowDeletion(id: number) {//take in id, find index of object in array given id before removing through splice
        let _fieldRows = [...fieldRows]
        let idx = _fieldRows.findIndex(fieldRow => fieldRow.id === id)
        _fieldRows.splice(idx, 1)
        setFieldRows(_fieldRows)
    }

    function handleFieldNameEdit(id: number, fieldName: string) { //take in id and fieldname, find index of object in array given id before updating the fieldname
        let _fieldRows = [...fieldRows]
        let idx = _fieldRows.findIndex(fieldRow => fieldRow.id === id)
        _fieldRows[idx].fieldName = fieldName

        setFieldRows(_fieldRows)
    }

    function handleFieldTypeEdit(id: number, fieldType: string) { //take in id and fieldtype, find index of object in array given id before updating the fieldtype 
        let _fieldRows = [...fieldRows]
        let idx = _fieldRows.findIndex(fieldRow => fieldRow.id === id)
        _fieldRows[idx].fieldType = fieldType

        setFieldRows(_fieldRows)

    }

    function handleRelationNameChange(event: React.ChangeEvent<HTMLInputElement>) { //take an prameter and sets relationName to input
        setRelationName(event.target.value)
    }

    function handleInsertionValueEdit(event: React.ChangeEvent<HTMLInputElement>, col: string) {//take two prameter and update value of the column with insertion values 
        setRelationName(event.target.value)
        let _insertionValues = { ...insertionValues }
        _insertionValues[col] = event.target.value
        setInsertionValues(_insertionValues)
    }

    function handleUpdateValueEdit(event: React.ChangeEvent<HTMLInputElement>, col: string) { //take two prameter and update value of the column with updatevalues 
        let _updateValues = { ...updateValues }
        _updateValues[col] = event.target.value
        setUpdateValues(_updateValues)
    }

    async function hanldeRelationCreation() { //create new relation given input and call respetive api and methods 
        let body: { [name: string]: string } = {}

        fieldRows.forEach(fieldRow => {
            if (fieldRow.fieldName === "") {
                fieldRow.fieldName = "no_name"
            }
            body[fieldRow.fieldName] = DataTypes[fieldRow.fieldType]
        }
        )

        let relation = {
            name: relationName,
            body: body
        }

        await api.createRelation(relation)

        let submittedRelation = await api.getRelation(relationName)

        //? Updating states for edit and add fields
        let _insertionValues: StringMap = {}
        let _updateValues: StringMap = {}
        submittedRelation.columns.forEach(col => {
            if (col !== "id")
                _insertionValues[col] = ""

            _updateValues[col] = ""
        })
        setInsertionValues(_insertionValues)
        setUpdateValues(_updateValues)


        props.onRelationChange(submittedRelation)
        setShowDefinitionField(false)
    }

    async function handleEntryInsertion() { //handle insertion of new entry into data base
        let valueTypesq: StringMap = {}
        for (let key of Object.keys(insertionValues)) {
            let fieldValue = fieldRows.find(row => row.fieldName == key)
            if (fieldValue) {
                valueTypesq[key] = DataTypes[fieldValue.fieldType]
            }
        }

        let insertionData = {
            name: currentRelationName,
            body: { name: insertionValues.name, host_id: parseInt(insertionValues.host_id), host_name: insertionValues.host_name, neighbourhood: insertionValues.neighbourhood, room_type: insertionValues.room_type, price: parseInt(insertionValues.price), availability: parseInt(insertionValues.availability) },
            valueTypes: valueTypesq
        }


        console.log(insertionData)
        let success = await api.insertEntry(insertionData)
        console.log(success)
        if (!success) {
            return
        }
        let latestRelation = await api.getRelation(currentRelationName)
        const newValues = { ...insertionValues }
        for (let key of Object.keys(insertionValues)) {
            newValues[key] = ""
        }
        setInsertionValues(newValues)
        props.onRelationChange(latestRelation)
    }


    async function handleEntryUpdate() { //handle updates of existing entries in database
        let updateData = {
            name: currentRelationName,
            body: updateValues,
            id: updateValues.id
        }
        let success = await api.updateEntry(updateData)

        if (!success) {
            return
        }
        let latestRelation = await api.getRelation(currentRelationName)
        props.onRelationChange(latestRelation)
        const newValues = { ...updateValues }
        for (let key of Object.keys(updateValues)) {
            newValues[key] = ""
        }
        setUpdateValues(newValues)
    }

    async function handleEntryDeletion() { //handle deletion of existing entries in database
        let deletionData = {
            relationName: currentRelationName,
            deletionId
        }
        let success = await api.deleteEntry(deletionData)
        console.log(deletionData)

        if (!success) {
            return
        }
        let latestRelation = await api.getRelation(currentRelationName)
        props.onRelationChange(latestRelation)
        setDeletionId(-1)
    }

    function handleDeleteValueEdit(event: React.ChangeEvent<HTMLInputElement>) {
        let _deletionId = parseInt(event.currentTarget.value)
        setDeletionId(_deletionId)
    }

    async function handleDeletedTable(event: any) { //handle deletion of table in database
        const res = await api.deleteTable(relationName)
        props.onDeleteTable();
    }


    async function getFilteredTable() { //calls filterTable from the api to get a filtered table based on price filter
        const result = await api.filterTable({
            price: parseInt(priceFilter)
        }) as any[];
        props.onRelationChange({
            columns: props.relationView.columns,
            rows: result.map(row => ({
                id: row[0],
                name: row[1],
                host_id: row[2],
                host_name: row[3],
                neighbourhood: row[4],
                room_type: row[5],
                price: row[6],
                availability: row[7]
            }))
        })

    }

}

export default AdminView