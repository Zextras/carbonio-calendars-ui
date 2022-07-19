/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
	Container,
	ContainerProps,
	Divider,
	Icon,
	IconButton,
	Padding,
	Row,
	Text
} from '@zextras/carbonio-design-system';
import { replaceHistory } from '@zextras/carbonio-shell-ui';
import { isNil, map } from 'lodash';
import React, { ReactElement, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { createCallbacks } from '../../commons/editor-generator';
import { selectActiveEditorId, selectEditorTitle } from '../../store/selectors/editor';
import { EditorCallbacks } from '../../types/editor';
import { EditorPanel } from './editor-panel';

const BackgroundContainer = styled.div`
	z-index: 10;
	position: absolute;
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	background-color: rgba(0, 0, 0, 0.73);
	border-radius: 0;
`;

export const AppointmentCardContainer = styled(Container)<ContainerProps & { expanded?: boolean }>`
	z-index: 10;
	position: absolute;
	top: ${({ expanded }): string => (expanded ? '16px' : '16px')};
	right: ${({ expanded }): string => (expanded ? '16px' : '16px')};
	bottom: ${({ expanded }): string => (expanded ? '0' : '12px')};
	left: ${({ expanded }): string => (expanded ? '16px' : 'max(calc(100% - 680px), 12px)')};
	transition: left 0.2s ease-in-out;
	height: auto;
	width: auto;
	overflow: hidden;
	max-height: 100%;
`;

type HeaderProps = {
	editorId: string;
	expanded: boolean;
	setExpanded: (arg: (e: boolean) => boolean) => void;
	callbacks: EditorCallbacks;
};

const Header = ({
	editorId,
	expanded,
	setExpanded,
	callbacks
}: HeaderProps): ReactElement | null => {
	const [t] = useTranslation();

	const title = useSelector(selectEditorTitle(editorId));

	const headerItems = useMemo(
		() => [
			{
				id: 'expand',
				icon: expanded ? 'Collapse' : 'Expand',
				label: '',
				click: (): void => setExpanded((e: boolean) => !e)
			},
			{
				id: 'close',
				icon: 'CloseOutline',
				label: '',
				click: (): void => {
					callbacks.closeCurrentEditor();
				}
			}
		],
		[callbacks, expanded, setExpanded]
	);

	return !isNil(title) ? (
		<>
			<Row
				mainAlignment="flex-start"
				crossAlignment="center"
				orientation="horizontal"
				background="gray5"
				width="fill"
				height="48px"
				padding={{ vertical: 'small' }}
			>
				<Row padding={{ horizontal: 'large' }}>
					<Icon icon={'CalendarModOutline'} />
				</Row>
				<Row takeAvailableSpace mainAlignment="flex-start">
					<Text size="medium" overflow="ellipsis">
						{title ?? t('label.no_subject', 'No subject')}
					</Text>
				</Row>
				<Row height="40px" mainAlignment="flex-start" style={{ overflow: 'hidden' }}>
					{headerItems &&
						map(headerItems, (action) => (
							<IconButton key={action.id} icon={action.icon} onClick={action.click} />
						))}
					<Padding right="extrasmall" />
				</Row>
			</Row>
			<Divider />
		</>
	) : null;
};

const EditorPanelWrapper = (): ReactElement | null => {
	const editorId = useSelector(selectActiveEditorId);
	const [expanded, setExpanded] = useState(false);
	const callbacks = useMemo(() => (editorId ? createCallbacks(editorId) : undefined), [editorId]);

	useEffect(() => {
		if (!editorId) {
			replaceHistory('');
		}
	}, [editorId]);

	return editorId && callbacks ? (
		<>
			{expanded && <BackgroundContainer />}
			<AppointmentCardContainer background="gray5" mainAlignment="flex-start" expanded={expanded}>
				<Header
					editorId={editorId}
					expanded={expanded}
					setExpanded={setExpanded}
					callbacks={callbacks}
				/>
				<EditorPanel editorId={editorId} callbacks={callbacks} expanded={expanded} />
			</AppointmentCardContainer>
		</>
	) : null;
};

export default EditorPanelWrapper;
