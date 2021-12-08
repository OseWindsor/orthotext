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
                await db.execute("insert into participants (firstName, lastName) values (?,?)",["Jane", "Doe"])
                console.log("inserted")
            }

        }
        getData()
      },[])

    return (
        <DropDownPicker
        zIndex={3000}
        zIndexInverse={1000}
        open={participantOpen}
        value={participantValue}
        searchable={true}
        onChangeValue={handleOnClick}
        placeholder="Select Participant"
        items={participants}
        setOpen={setParticipantOpen}
        setValue={setParticipantValue}
        showArrowIcon={false}
        showTickIcon={false}
        setItems={setParticipants}
        labelStyle = {{textAlign: 'center', fontSize:18}}
        textStyle = {{textAlign: 'center', fontSize:18}}
      />
    )
}