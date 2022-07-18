/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useBoard } from '@zextras/carbonio-shell-ui';
import React, { ReactElement } from 'react';
import { EditorPanel } from './editor-panel';

const BoardEditPanel = (): ReactElement | null => {
	const board = useBoard();

	return board?.id ? (
		<EditorPanel editorId={board?.id} callbacks={board.context.callbacks} />
	) : null;
};
export default BoardEditPanel;
