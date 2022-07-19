/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { map } from 'lodash';
import React, { DragEvent, ReactElement, ReactNode, useCallback, useMemo, useState } from 'react';
import { Container } from '@zextras/carbonio-design-system';
import { EditorCallbacks } from '../../../types/editor';
import { addAttachments } from './editor-attachments';
import { DropZoneAttachment } from './editor-dropzone-attachments';

type DropzoneProps = {
	editorId: string;
	callbacks: EditorCallbacks;
	expanded?: boolean;
	children: ReactNode;
};

export const EditorDropZone = ({
	editorId,
	callbacks,
	children
}: DropzoneProps): ReactElement | null => {
	const [dropZoneEnable, setDropZoneEnable] = useState(false);
	const parts: never[] = useMemo(() => [], []);

	const onDragOver = useCallback((event: DragEvent): void => {
		event.preventDefault();
		setDropZoneEnable(true);
	}, []);

	const onDrop = useCallback(
		(event: DragEvent): void => {
			event.preventDefault();
			setDropZoneEnable(false);
			if (event?.dataTransfer?.files) {
				addAttachments(editorId, parts, event.dataTransfer.files).then(({ payload, mp }) => {
					const attachments = map(payload, (file) => ({
						contentType: file.ct,
						disposition: 'attachment',
						filename: file.filename,
						name: undefined,
						size: file.s,
						aid: file.aid
					}));
					callbacks.onAttachmentsChange({ aid: map(payload, (el) => el.aid), mp }, attachments);
				});
			}
		},
		[callbacks, editorId, parts]
	);

	const onDragLeave = useCallback((event: DragEvent): void => {
		event.preventDefault();
		setDropZoneEnable(false);
	}, []);

	return (
		<Container
			height="fit"
			background="gray6"
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			padding={{ all: 'large', bottom: 'extralarge' }}
			onDragOver={onDragOver}
			style={{
				overflowY: 'auto',
				display: 'block',
				float: 'left'
			}}
		>
			{dropZoneEnable ? (
				<DropZoneAttachment onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave} />
			) : null}
			{children}
		</Container>
	);
};
