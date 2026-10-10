import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { Button, FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("tela1.db");

db.execSync(`
  CREATE TABLE IF NOT EXISTS tarefas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    texto TEXT NOT NULL,
    prioridade TEXT NOT NULL
  );
`);

function listar() {
    return db.getAllSync("SELECT * FROM tarefas ORDER BY id DESC");
}

function adicionar(texto, prioridade) {
    db.runSync("INSERT INTO tarefas (texto, prioridade) VALUES (?, ?)", [texto, prioridade]);
}

function remover(id) {
    db.runSync("DELETE FROM tarefas WHERE id = ?", [id]);
}

function edita(id, texto, prioridade) {
    db.runSync("UPDATE tarefas SET texto = ?, prioridade = ? WHERE id = ?", [texto, prioridade, id]);
}

export default function ListaDb() {

    const [texto, setTexto] = useState("");
    const [lista, setLista] = useState([]);
    const [prioridade, setPrioridade] = useState("");
    const [idEditando, setIdEditando] = useState(0);

    function carregar() {
        setLista(listar());
    }

    useEffect(() => {
        carregar();
    }, []);

    function salvar() {
        adicionar(texto, prioridade);
        setTexto("");
        setPrioridade("");
        carregar();
    }

    function excluir(id) {
        remover(id);
        carregar();
    }

    function editar(lista) {
        setIdEditando(lista.id);
        setTexto(lista.texto);
        setPrioridade(lista.prioridade);
    }

    function guardarEdicao() {
        if (idEditando == 0) {
            salvar();
        } else {
            edita(idEditando, texto, prioridade);
        }
        setTexto("");
         setIdEditando(0);
        setPrioridade("");
        carregar();
    }


    return (
        <SafeAreaView style={styles.tela} edges={["bottom"]}>
            <Stack.Screen options={{ title: "Lista" }} />
            <Text style={styles.titulo}>Agenda de contatos</Text>
            <TextInput
                style={styles.entrada}
                placeholder="Digite um contato..."
                value={texto}
                onChangeText={setTexto}
            />
            <TextInput
                style={styles.entrada}
                placeholder="Digite um telefone..."
                keyboardType="numeric"
                value={prioridade}
                onChangeText={setPrioridade}
            />
            {idEditando !== 0 ? (
                <Button title="Guardar Edição" onPress={guardarEdicao} />
            ) : (
                <Button title="Salvar" onPress={salvar} />
            )}
            <FlatList
                data={lista}
                renderItem={({ item }) => (
                    <View style={styles.itemContainer}>
                        <Text style={styles.item}>{item.texto} {item.prioridade}</Text>
                        <Button title="🗑️" color="#D64545" onPress={() => excluir(item.id)} />
                        <Button title="✏️" color="#48494b" onPress={() => editar(item)} />
                    </View>
                )}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    tela: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    titulo: {
        fontSize: 35,
        fontWeight: "bold",
        textAlign: "center",
    },
    entrada: {
        borderWidth: 1,
        borderColor: "#030303",
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
    },
    item: {
        flex: 1,
        backgroundColor: "#48494b",
        color: "#FFFFFF",
        padding: 10,
        marginTop: 5,
    },
    itemContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
});
//Olá casada >:)