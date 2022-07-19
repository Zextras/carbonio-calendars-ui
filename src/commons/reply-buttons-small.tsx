/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
	Button,
	Container,
	Dropdown,
	Icon,
	ModalManagerContext,
	Padding,
	Row,
	RowProps,
	SnackbarManagerContext,
	Text
} from '@zextras/carbonio-design-system';
import { replaceHistory, useTags } from '@zextras/carbonio-shell-ui';
import { map, noop, toUpper } from 'lodash';
import React, {
	ReactElement,
	SyntheticEvent,
	useCallback,
	useContext,
	useMemo,
	useState
} from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { useEventActions } from '../hooks/use-event-actions';
import { useInvite } from '../hooks/use-invite';
import { sendInviteResponse } from '../store/actions/send-invite-response';
import { EventType } from '../types/event';
import { ParticipationStatus } from '../types/store/invite';
import { createAndApplyTag } from '../view/tags/tag-actions';

const AttendingRow = styled(Row)<RowProps & { invtReply: ResponseProp }>`
	border: 1px solid ${(props): string => props.theme.palette[props.invtReply.color].regular};
`;

type ResponseProp = {
	id: string;
	icon: string;
	label: string;
	value: ParticipationStatus;
	action?: () => void;
	color: string;
	selected?: boolean;
	customComponent?: ReactElement;
};

type ReplyButtonProps = {
	inviteId: string;
	compNum: number;
	event: EventType;
	participationStatus: ParticipationStatus;
};

export const ReplyButtonsPartSmall = ({
	participationStatus,
	inviteId,
	compNum,
	event
}: ReplyButtonProps): ReactElement => {
	const [t] = useTranslation();
	const dispatch = useDispatch();
	const createModal = useContext(ModalManagerContext);
	const tags = useTags();
	const createSnackbar = useContext(SnackbarManagerContext);
	const invite = useInvite(event.resource.inviteId);
	const replyAction = useCallback(
		(action) => {
			dispatch(
				sendInviteResponse({
					inviteId,
					updateOrganizer: false,
					action,
					compNum
				})
			);
		},
		[dispatch, inviteId, compNum]
	);

	const attendeesOptions: Array<ResponseProp> = useMemo(
		() => [
			{
				id: 'option_2',
				icon: 'CheckmarkCircle2',
				label: toUpper(t('event.action.yes', 'Yes')),
				value: 'AC',
				action: () => replyAction('ACCEPT'),
				color: 'success',
				customComponent: (
					<Row>
						<Padding right="small">
							<Icon color="success" icon="CheckmarkCircle2" />
						</Padding>
						<Padding right="small">
							<Text>{toUpper(t('event.action.yes', 'Yes'))}</Text>
						</Padding>
					</Row>
				)
			},
			{
				id: 'option_3',
				icon: 'QuestionMarkCircle',
				label: toUpper(t('label.tentative', 'Tentative')),
				value: 'TE',
				action: () => replyAction('TENTATIVE'),
				color: 'warning',
				customComponent: (
					<Row>
						<Padding right="small">
							<Icon color="warning" icon="QuestionMarkCircle" />
						</Padding>
						<Padding right="small">
							<Text>{toUpper(t('label.tentative', 'Tentative'))}</Text>
						</Padding>
					</Row>
				)
			},
			{
				id: 'option_1',
				icon: 'CloseCircle',
				label: toUpper(t('event.action.no', 'No')),
				value: 'NE',
				action: () => replyAction('DECLINE'),
				color: 'error',
				customComponent: (
					<Row>
						<Padding right="small">
							<Icon color="error" icon="CloseCircle" />
						</Padding>
						<Padding right="small">
							<Text>{toUpper(t('event.action.no', 'No'))}</Text>
						</Padding>
					</Row>
				)
			}
		],
		[replyAction, t]
	);

	const attendingResponse = useCallback(
		(value: ParticipationStatus): ResponseProp => {
			switch (value) {
				case 'TE':
					return {
						id: 'option_3',
						icon: 'QuestionMarkCircle',
						label: toUpper(t('label.tentative', 'Tentative')),
						value: 'TE',
						color: 'warning',
						selected: false
					};
				case 'AC':
					return {
						id: 'option_2',
						icon: 'CheckmarkCircle2',
						label: toUpper(t('event.action.yes', 'Yes')),
						value: 'AC',
						color: 'success',
						selected: false
					};

				case 'DE':
					return {
						id: 'option_1',
						icon: 'CloseCircle',
						label: toUpper(t('event.action.no', 'No')),
						value: 'DE',
						color: 'error'
					};
				case 'NE':
					return {
						id: 'option_4',
						icon: 'CalendarWarning',
						label: toUpper(t('event.action.needs_action', 'Needs action')),
						value: 'NE',
						color: 'primary'
					};
				default:
					return {
						id: 'option_4',
						icon: 'CalendarWarning',
						label: toUpper(t('event.action.needs_action', 'Needs action')),
						value: 'NE',
						color: 'primary'
					};
			}
		},
		[t]
	);

	const defaultValue = useMemo(
		() => attendingResponse(participationStatus),
		[attendingResponse, participationStatus]
	);
	const [invtReply, setInvtReply] = useState(defaultValue);

	const context = useMemo(
		() => ({
			replaceHistory,
			dispatch,
			createModal,
			createSnackbar,
			isSeries: false,
			isInstance: true,
			isException: event.resource.isException,
			tags,
			createAndApplyTag,
			ridZ: event.resource.ridZ
		}),
		[createModal, createSnackbar, dispatch, event.resource.isException, event.resource.ridZ, tags]
	);

	const actions = useEventActions(invite, event, context, t, false);

	const otherActions = useMemo(
		() =>
			map(actions ?? [], (action) => ({
				id: action.label,
				icon: action.icon,
				label: action.label,
				key: action.id,
				color: action.color,
				items: action.items,
				customComponent: action.customComponent,
				click: (ev: SyntheticEvent<HTMLElement, Event> | KeyboardEvent): void => {
					ev.stopPropagation();
					action.click();
				}
			})),
		[actions]
	);
	const attendeesResponseOptions = useMemo(
		() =>
			map(attendeesOptions, (option) => ({
				id: option.label,
				icon: option.icon,
				label: option.label,
				value: option.value,
				key: option.id,
				color: option.color,
				customComponent: option.customComponent,
				click: (ev: SyntheticEvent<HTMLElement, Event> | KeyboardEvent): void => {
					ev.stopPropagation();
					if (option.action) {
						option.action();
					}
					setInvtReply(option);
				}
			})),
		[attendeesOptions]
	);
	return (
		<Container orientation="horizontal" mainAlignment="flex-end">
			<Dropdown
				disableAutoFocus
				items={attendeesResponseOptions}
				style={{ cursor: 'pointer' }}
				placement="bottom-end"
			>
				<AttendingRow padding={{ all: 'small' }} invtReply={invtReply}>
					<Row>
						<Icon color={invtReply.color} icon={invtReply.icon} />
					</Row>

					<Row>
						<Padding horizontal="small">
							<Text color={invtReply.color}>{invtReply.label}</Text>
						</Padding>
						<Icon color={invtReply.color} icon="ArrowIosDownwardOutline" />
					</Row>
				</AttendingRow>
			</Dropdown>
			<Padding left="small">
				<Dropdown disableAutoFocus items={otherActions} placement="bottom-end">
					<Button
						type="outlined"
						label={t('label.other_actions', 'Other actions')}
						icon="ArrowIosDownwardOutline"
						style={{ padding: '7px 4px' }}
						onClick={noop}
					/>
				</Dropdown>
			</Padding>
		</Container>
	);
};
