import React, { useState, useEffect } from 'react';
import {SafeAreaView, StyleSheet, TextInput, View, Text } from "react-native";
import DropDownPicker from 'react-native-dropdown-picker';
import {Database} from "../Database"

const db = new Database("result.db");
export const ParticipantDrop = ({onUpdate }) => {
    const [participantOpen, setParticipantOpen] = useState(false);
    const [participantValue, setParticipantValue] = useState(1);
    const [participants, setParticipants] = useState([
      {label: 'Jane Doe', value: 1},
    ]);
    let values = []
    const handleOnClick = () => {
        onUpdate(participantValue)
      }

      useEffect(() => {
        async function getData(){
            let res = await db.execute("select * from participants")
            if(res.rows.length != 0){
                res.rows.forEach(element => {
                    values.push({label:element.firstName + " " + element.lastName, value:element.id})
                })
                setParticipants(values)
            }else{
                await db.execute("insert into participants (firstName, lastName, handSize) values (?,?,?)",["Jane", "Doe", "Medium"])
                console.log("inserted")
            }

        }
        getData()
      },[])

    return (
        <DropDownPicker
        zIndex={4000}
        zIndexInverse={1000}
        open={participantOpen}
        value={participantValue}
        dropDownDirection={"BOTTOM"}
        searchable={true}
        style={{...styles.dropStyle}}
        onChangeValue={handleOnClick}
        placeholder="Select Participant"
        items={participants}
        setOpen={setParticipantOpen}
        setValue={setParticipantValue}
        setItems={setParticipants}
        labelStyle = {{textAlign: 'left', fontSize:18}}
        textStyle = {{textAlign: 'left', fontSize:18}}
      />
    )
}

const styles = StyleSheet.create({
  dropStyle: {borderWidth:0,    shadowColor: '#000',
  shadowOpacity: 0.4,
  shadowOffset: { width: 0, height: 1 },
  shadowRadius: 3,}
})