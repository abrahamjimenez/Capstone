"use client"

import React from 'react';
import {Button, Group, Textarea, TextInput} from '@mantine/core';
import { useForm } from '@mantine/form';
import {action} from "@/utils/contact-form-actions";

export interface Values {
    name: string;
    email: string;
    phone: string;
    comment: string;
}

const ContactForm = () => {
    const form = useForm({
        mode: 'uncontrolled',
        initialValues: {
            name: '',
            email: '',
            phone: '',
            comment: '',
        },

        validate: {
            email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Please enter an email address'),
        },
    });

    const handleSubmit = async (values: Values) => {
        await action({ values });
    };

    return (
        <form className={"flex flex-col gap-4"} onSubmit={form.onSubmit(handleSubmit)}>
            <TextInput
                label="Name"
                placeholder="Name"
                key={form.key('name')}
                {...form.getInputProps('name')}
            />

            <TextInput
                withAsterisk
                label="Email"
                placeholder="Email *"
                key={form.key('email')}
                {...form.getInputProps('email')}
            />

            <TextInput
                label="Phone Number"
                placeholder="Phone number"
                key={form.key('phone')}
                {...form.getInputProps('phone')}
            />

            <Textarea
                autosize
                minRows={4}
                label="Comment"
                placeholder="Comment"
                key={form.key('comment')}
                {...form.getInputProps('comment')}
            />

            <Group justify="flex-start" mt="md">
                <Button type="submit">Send</Button>
            </Group>
        </form>
    );
};

export default ContactForm;
