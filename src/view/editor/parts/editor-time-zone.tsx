/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Select } from '@zextras/carbonio-design-system';
import { useUserSettings } from '@zextras/carbonio-shell-ui';
import React, { ReactElement, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { findLabel, TimeZonesOptions } from '../../../settings/components/utils';
import { selectEditorTimezone } from '../../../store/selectors/editor';
import { EditorProps } from '../../../types/editor';

type SelectValue =
	| {
			label: string;
			value: string;
	  }
	| undefined;

export const EditorTimezone = ({ editorId, callbacks }: EditorProps): ReactElement | null => {
	const [t] = useTranslation();
	const [value, setValue] = useState<SelectValue>(undefined);
	const timezone = useSelector(selectEditorTimezone(editorId));
	const { onTimeZoneChange } = callbacks;
	const timeZonesOptions = useMemo(() => TimeZonesOptions(t), [t]);
	const { zimbraPrefUseTimeZoneListInCalendar } = useUserSettings().prefs;

	useEffect(() => {
		if (timezone) {
			setValue({
				label: findLabel(timeZonesOptions, timezone),
				value: timezone
			});
		}
	}, [timeZonesOptions, timezone]);

	return value && zimbraPrefUseTimeZoneListInCalendar === 'TRUE' ? (
		<Select
			items={timeZonesOptions}
			multiple={false}
			onChange={(item): void => {
				// Typescript is pointing to the wrong overload
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				onTimeZoneChange(item?.value);
			}}
			selection={value}
		/>
	) : null;
};
