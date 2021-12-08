import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TouchableWithoutFeedback, Dimensions  } from 'react-native';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import { Table, TableWrapper, Cell, Row, Rows, Col, Cols } from 'react-native-table-component';
import {Database} from "../../Database.js"
const { Parser } = require('json2csv');
const json2csvParser = new Parser();
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

const db = new Database("result.db");

export const typeResultPage = (props) => {

    const route = useRoute();
    const navigation = useNavigation();
    const [participant, setParticipant] = useState(null)
    const [tableHead, SetTableHead] = useState(["",'Words per minute', 'Accuracy'])
    const [tableData, setTableData] = useState([['50','50'],['50','50'],['50','50'],['50','50'],['50','50']])
    const [tableTitle, setTableTitle] = useState(['Trial 1','Trial 2', 'Trial 3', 'Trial 4', 'Trial 5'])
    let col1 = []

    async function downloadData() {
        let res = await db.execute("select id,trialNumber as Trial,timeElapsed as Elapsed_Time,wpm as Words_per_minute,accuracy as Accuracy from typeResult where tid = ?",[props.route.params.tid])
        const csv = json2csvParser.parse(res.rows);
        //console.log(csv);
        let prodNmae = props.route.params.product.replace(/\s/g, '');
        let partName = participant.replace(/\s/g, '');
        let filename = 'typeResult_id_' + props.route.params.tid + '_' + props.route.params.device + '_' + prodNmae + '_' + partName + '.csv'; // or some other way to generate filename
        let filepath = `${FileSystem.documentDirectory}/${filename}`;
        await FileSystem.writeAsStringAsync(filepath, csv);
        await Sharing.shareAsync(filepath, { mimeType: 'text/csv' })
    }

    useEffect(() => {
        async function getData(){
            for(let i=1;i<6;i+=1){
                let res = await db.execute("select * from typeResult where tid=? and trialNumber = ? order by id desc limit 1",[props.route.params.tid,i])
                console.log(res.rows)
                col1.push([res.rows[0].wpm,res.rows[0].accuracy])
            }
            let res1 = await db.execute("select firstName, lastName from participants where id = ?",[props.route.params.pid])
            setParticipant(res1.rows[0].firstName + " " + res1.rows[0].lastName)
            console.log(col1)
            setTableData(col1)
        }
        getData()
    },[props.route.params.tid])
    return (
        <ScrollView>
            <View style={{margin: 7, alignItems: "center"}}>
                <Text style = {{fontSize: 20, fontWeight: "100"}}>Summary Table</Text>
            </View>
            <View style={{ backgroundColor: "#fff", margin: 7, elevation: 13, borderWidth: 1, borderRadius: 10}}>
                <Table borderStyle={{borderWidth: 0}} style={{paddingTop: 15, paddingLeft: 5}}>
                    <Row data={tableHead} flexArr={[1, 2, 2]} style={styles.head} textStyle={styles.text}/>
                    <TableWrapper style={styles.wrapper}>
                        <Col data={tableTitle} style={styles.title} textStyle={styles.textTitle}/>
                        <Rows data={tableData} flexArr={[2, 2]} style={styles.row} textStyle={styles.text}/>
                    </TableWrapper>
                </Table>
            </View>
            <View style ={{alignItems: 'center', borderWidth: 1, borderRadius:10, padding: 10, margin: 10}}>
                <Text style = {{fontWeight:'bold'}}>Device Tested: {props.route.params.device}</Text>
            </View>
            <View style ={{alignItems: 'center', borderWidth: 1, borderRadius:10, padding: 10, margin: 10}}>
                <Text style={{fontWeight:'bold'}}>Product Tested: {props.route.params.product}</Text>
            </View>
            <View style ={{alignItems: 'center', borderWidth: 1, borderRadius:10, padding: 10, margin: 10}}>
                <Text style={{fontWeight:'bold'}}>Participant: {participant}</Text>
            </View>
            <View style={{alignItems: "center"}}>
                <TouchableOpacity onPress = {downloadData} style={{...styles.roundButton}}>
                    <Text>Download Data</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress = {() => navigation.navigate('resultSelect')} style={{...styles.roundButton, marginBottom: 40}}>
                    <Text>View Another Result</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 15, backgroundColor: '#fff' },
    head: {  height: 40},
    wrapper: { flexDirection: 'row' },
    title: { flex: 1},
    row: {  height: 60  },
    text: { textAlign: 'center', fontWeight: 'bold', fontSize: 15 },
    textTitle: {textAlign: 'left', fontWeight: 'bold', fontSize: 15, padding: 5},
    roundButton: {
        elevation: 5,
        marginTop: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        width: "95%",
        height: 60,
        backgroundColor: '#d3d3d3',
    },
  });