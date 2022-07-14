/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Icon, Padding, Text, Tooltip } from '@zextras/carbonio-design-system';
import { map } from 'lodash';
import React, { ReactElement, useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { uploadParts } from '../../../commons/upload-parts';
import { retrieveAttachmentsType } from '../../../normalizations/normalizations-utils';
import { EditorProps } from '../../../types/editor';
import { ResizedIconCheckbox } from './editor-styled-components';

const FileInput = styled.input`
	display: none;
`;

export const addAttachments = async (
	editorId: string,
	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	parts: any,
	files: FileList
): Promise<{ payload: any; mp: any; files: any }> => {
	const { payload } = await uploadParts(files);
	const mp = parts && retrieveAttachmentsType(parts, 'attachment', editorId);
	return { payload, mp, files };
};

export const EditorAttachmentsButton = ({ editorId, callbacks }: EditorProps): ReactElement => {
	const [t] = useTranslation();
	const inputRef = useRef<HTMLInputElement | null>(null);
	const [openDD, setOpenDD] = useState(false);
	const { onAttachmentsChange } = callbacks;
	const parts: never[] = useMemo(() => [], []);

	const onFileClick = useCallback(() => {
		if (inputRef.current) {
			inputRef.current.click();
		}
	}, []);

	const onChange = useCallback((): void => {
		if (inputRef?.current?.files) {
			addAttachments(editorId, parts, inputRef.current.files).then(({ payload, mp }) => {
				const attachments = map(payload, (file) => ({
					contentType: file.ct,
					disposition: 'attachment',
					filename: file.filename,
					name: undefined,
					size: file.s,
					aid: file.aid
				}));
				onAttachmentsChange({ aid: map(payload, (el) => el.aid), mp }, attachments);
			});
		}
	}, [editorId, parts, onAttachmentsChange]);

	return (
		<>
			<Tooltip label={t('tooltip.add_attachments', 'Add attachments')}>
				<ResizedIconCheckbox size="medium" icon="AttachOutline" onClick={onFileClick} />
			</Tooltip>
			<FileInput type="file" ref={inputRef} onChange={onChange} multiple />
		</>
	);
};
