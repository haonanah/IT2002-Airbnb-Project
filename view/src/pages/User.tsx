import '../App.scss'
import TableView from '../components/TableView'
import EditView from '../components/AdminView'
import { useEffect, useState } from 'react'
import { airbnbdata } from '../data/airbnb'
import * as api from '../api'
import UserView from '../components/UserView'

// need to edit this into user interface, this is a copy paste of the admin interface

// ? This interface/object template/class - defines the JSON structure of the displayed table/relation for this application
export interface RelationView {
  columns: Array<string>
  rows: Array<{ [key: string]: any }> // ? represents the string-key, arbitrary-value type, for example [{"id": 2, "name": "mehdi"}, {"id": 1, "name": "fuad"}]}
}

// ? In React, a function returning HTML script is called a component, 
// ? and App is our main component, hosting the table editing menu and table view
function User() {
  // ? state (currentRelationView) - is the JS/TS object holding the dynamic values
  // ? setState (setCurrentRelationView) - is the JS/TS method used to update the state object
  // ? our state `currentRelationView` holds the necessary data to display the requested table/relation
  // ? Note the generic type we defined above - type strict will help you keep the track by its strict types
  const [currentRelationView, setCurrentRelationView] = useState<RelationView>({
    columns: [],
    rows: []
  })
  //const [searchResults, setSearchResults] = useState<Array<{ [key: string]: any }>>([])
  useEffect(() => {
    getDatabaseData();
  }, [])

  const getDatabaseData = async () => { //sets the view to an object containing columns and  rows of airbnb relation
    const res = await api.getRelation("airbnb")
    setCurrentRelationView({
      columns: res.columns,
      rows: res.rows
    })
  }

  return (
    // ? The main block containing all the editible DOM elements
    <div className="App">
      <div id="main-view">
        {/* Below component is the user edit menu to create/modify the required table. Refer to `handleRelationViewUpdate` to learn about props*/}
        <UserView relationView={currentRelationView} setSearchResults={setSearchResults} onRelationChange={handleRelationViewUpdate}/>
        {/* TableView component is just for displaying the table on the right side of the view */}
        {/* <TableView relationView={currentRelationView} /> */}
      </div>
    </div>
  )

  function setSearchResults(rows: Array<{ [key: string]: any }>) { //find the rows that fits search and replace the new view state 
    setCurrentRelationView({
      ...currentRelationView,
      rows
    })
  }

  // ? A props funcion for the EditView - keeping the relation view for up-to-date to be displayed on the right side of the window
  function handleRelationViewUpdate(relationView: RelationView) {  //modify to ensure proper display of values in html. It checks all data types 
    // ? Here a few data type handling is done in order to properly diplay the BOOLEAN types since HTML visualizes true and false types as blank
    // ? First loop iterates through the displayed rows
    for (let i = 0; i < relationView.rows.length; i++) {
      // ? The second loop checks each field type
      for (let fieldKey of Object.keys(relationView.rows[i])) {
        let fieldValue = relationView.rows[i][fieldKey]
        // ? And it stringifies it if it is boolean
        if (typeof (fieldValue) === 'boolean') {
          relationView.rows[i][fieldKey] = fieldValue.toString()
        }
      }
    }
    //? Sorting by ID for better sequential visualization
    relationView.rows = relationView.rows.sort((a, b) => a.id - b.id)
    // ? Funcionality of RelationView explained on the line it's defined
    setCurrentRelationView(relationView)
    // airbnbdata = relationView.rows
  }

  function deleteTable() { //delete entire table by setting relation view to nothing
    setCurrentRelationView({
      columns: [],
      rows: []
    })
  }

  // function filterTable(column_name: string, input: string) { 
  // }


}
export default User
