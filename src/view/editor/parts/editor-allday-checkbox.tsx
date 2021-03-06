/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Checkbox } from '@zextras/carbonio-design-system';
import { isNil } from 'lodash';
import React, { ReactElement, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import {
	selectEditorAllDay,
	selectEditorEnd,
	selectEditorStart
} from '../../../store/selectors/editor';
import { EditorCallbacks } from '../../../types/editor';

type AllDayProps = {
	editorId: string;
	callbacks: EditorCallbacks;
};

export const EditorAllDayCheckbox = ({ editorId, callbacks }: AllDayProps): ReactElement | null => {
	const allDay = useSelector(selectEditorAllDay(editorId));
	const start = useSelector(selectEditorStart(editorId));
	const end = useSelector(selectEditorEnd(editorId));
	const [t] = useTranslation();
	const { onAllDayChange } = callbacks;

	const startDate = useMemo(() => (start ? new Date(start) : undefined), [start]);
	const endDate = useMemo(() => (end ? new Date(end) : undefined), [end]);

	const onClick = useCallback(
		(e) => {
			if (e && startDate && endDate) {
				const startValue = startDate.setHours(0, 0, 0, 0);
				const endValue = endDate.setHours(0, 0, 0, 0);
				onAllDayChange(!allDay, startValue, endValue);
			}
			onAllDayChange(!allDay);
		},
		[allDay, endDate, onAllDayChange, startDate]
	);

	return !isNil(allDay) ? (
		<Checkbox label={t('label.all_day', 'All day')} onClick={onClick} value={allDay} />
	) : null;
};
