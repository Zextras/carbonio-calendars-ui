/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Padding } from '@zextras/carbonio-design-system';
import React, { ReactElement } from 'react';
import { useSelector } from 'react-redux';
import {
	selectEditorAllDay,
	selectEditorEnd,
	selectEditorStart
} from '../../../store/selectors/editor';
import { EditorCallbacks } from '../../../types/editor';
import StartDatePicker from '../../../commons/start-date-picker';
import EndDatePicker from '../../../commons/end-date-picker';
import Styler from '../../../commons/date-picker-style';

type DatePickerProps = {
	editorId: string;
	callbacks: EditorCallbacks;
};

export const EditorDatePicker = ({ editorId, callbacks }: DatePickerProps): ReactElement | null => {
	const allDay = useSelector(selectEditorAllDay(editorId));
	const start = useSelector(selectEditorStart(editorId));
	const end = useSelector(selectEditorEnd(editorId));
	const { onDateChange } = callbacks;

	return start && end ? (
		<Styler allDay={allDay} orientation="horizontal" height="fit" mainAlignment="flex-start">
			<StartDatePicker start={start} end={end} onChange={onDateChange} allDay={allDay} />
			<Padding left="small" />
			<EndDatePicker start={start} end={end} onChange={onDateChange} allDay={allDay} />
		</Styler>
	) : null;
};
