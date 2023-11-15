import { useState, useEffect } from "react";
import { Stack, TextField, Dropdown } from "@fluentui/react";
import { Button, Tooltip } from "@fluentui/react-components";
import { Send28Filled } from "@fluentui/react-icons";
import styles from "./QuestionInput.module.css";
import { getContextIndexData } from "../../api";
import { getToken } from "../../authConfig";
import { useLogin } from "../../authConfig";
import { useMsal } from "@azure/msal-react";

interface Props {
    onSend: (question: string, contextIndex: string) => void;
    disabled: boolean;
    placeholder?: string;
    clearOnSend?: boolean;
}

interface ContextOptions {
    key: string;
    text: string;
    data: string;
}


export const QuestionInput = ({ onSend, disabled, placeholder, clearOnSend }: Props) => {
    const [question, setQuestion] = useState<string>("");
    const [contextIndex, setContextIndex] = useState<string>("");
    const [contextOptions, setContextOptions] = useState<ContextOptions[]>([]);

    const client = useLogin ? useMsal().instance : undefined;

    const getContextIndexOptions = async () => {
        const token = client ? await getToken(client) : undefined;
        const responseData = await getContextIndexData(token?.accessToken)
        let contextResponse = await responseData.json()
        const optionsData: ContextOptions[] = Object.keys(contextResponse).map((k: string) => ({ key: k, text: contextResponse[k], data: contextResponse[k] }))
        setContextOptions(optionsData)
    }

    useEffect(() => {
        getContextIndexOptions();
    }, [])

    const sendQuestion = () => {
        if (disabled || !question.trim()) {
            return;
        }

        onSend(question, contextIndex);

        if (clearOnSend) {
            setQuestion("");
        }
    };

    const onEnterPress = (ev: React.KeyboardEvent<Element>) => {
        if (ev.key === "Enter" && !ev.shiftKey) {
            ev.preventDefault();
            sendQuestion();
        }
    };

    const onQuestionChange = (_ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        if (!newValue) {
            setQuestion("");
        } else if (newValue.length <= 1000) {
            setQuestion(newValue);
        }
    };

    const sendQuestionDisabled = disabled || !question.trim();


    const onContextChange = (d: any, option: any) => {
        console.log(option?.key)
        setContextIndex(option?.key);
    };

    return (
        <div>
            <Dropdown
                required
                label="Context"
                placeholder="Select context"
                onChange={onContextChange}
                options={contextOptions}
            />
            <Stack horizontal className={styles.questionInputContainer}>
                <TextField
                    className={styles.questionInputTextArea}
                    placeholder={placeholder}
                    multiline
                    resizable={false}
                    borderless
                    value={question}
                    onChange={onQuestionChange}
                    onKeyDown={onEnterPress}
                />
                <div className={styles.questionInputButtonsContainer}>
                    <Tooltip content="Ask question button" relationship="label">
                        <Button size="large" icon={<Send28Filled primaryFill="#01A982" />} disabled={sendQuestionDisabled} onClick={sendQuestion} />
                    </Tooltip>
                </div>
            </Stack>
        </div>
    );
};
