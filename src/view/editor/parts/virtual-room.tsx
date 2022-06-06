/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useIntegratedComponent } from '@zextras/carbonio-shell-ui';
import React from 'react';
import { useSelector } from 'react-redux';
import { selectEditorRoom } from '../../../store/selectors/editor';
import { EditorCallbacks } from '../../../types/editor';

type EditorRoomProps = {
	editorId: string;
	callbacks: EditorCallbacks;
	disabled?: boolean;
};

export const EditorVirtualRoom = ({
	editorId,
	callbacks,
	disabled = false
}: EditorRoomProps): JSX.Element | null => {
	const [RoomSelector, isRoomAvailable] = useIntegratedComponent('room-selector');
	const { onRoomChange } = callbacks;
	const room = useSelector(selectEditorRoom(editorId));

	return isRoomAvailable ? (
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		<RoomSelector onChange={onRoomChange} defaultValue={room} disabled={disabled} />
	) : null;
};
