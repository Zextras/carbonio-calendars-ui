/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import styled from 'styled-components';
import {
	Container,
	Divider,
	Dropdown,
	Icon,
	IconButton,
	ModalManagerContext,
	Row,
	SnackbarManagerContext,
	Text,
	useHiddenCount
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { replaceHistory, useTags } from '@zextras/carbonio-shell-ui';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { map, noop, some } from 'lodash';
import { useInvite } from '../../hooks/use-invite';
import { normalizeCalendarEvent } from '../../normalizations/normalize-calendar-events';
import { Store } from '../../types/store/store';
import { AppointmentCardContainer } from '../editor/editor-panel-wrapper';
import { createAndApplyTag } from '../tags/tag-actions';
import { ParticipantsPart } from './participants-part';
import StyledDivider from '../../commons/styled-divider';
import { extractBody } from '../../commons/body-message-renderer';
import { useQuickActions } from '../../hooks/use-quick-actions';
import { selectCalendar } from '../../store/selectors/calendars';
import { selectAppointment, selectAppointmentInstance } from '../../store/selectors/appointments';
import { DetailsPart } from './details-part';
import { ReplyButtonsPart } from './reply-buttons-part';
import { MessagePart } from './message-part';
import { ReminderPart } from './reminder-part';
import { AttachmentsBlock } from './attachments-part';

const BodyContainer = styled(Container)`
	overflow-y: auto;
`;

const ActionButtons = ({ actions }: { actions: Array<any> }): ReactElement => {
	const actionContainerRef = useRef(null);
	const [, recalculateHiddenActions] = useHiddenCount(actionContainerRef, true);

	useEffect(() => {
		recalculateHiddenActions();
	}, [actions, recalculateHiddenActions]);

	return (
		<Row wrap="nowrap" height="100%" mainAlignment="flex-end" style={{ maxWidth: '160px' }}>
			<Row
				//	ref={actionContainerRef}
				height="40px"
				mainAlignment="flex-start"
				style={{ overflow: 'hidden' }}
			>
				{actions &&
					map(actions, (action) =>
						action.items ? (
							<Dropdown items={action.items} key={`button ${action.id}`}>
								<Row takeAvailableSpace>
									<IconButton icon="TagsMoreOutline" onClick={noop} />
								</Row>
							</Dropdown>
						) : (
							<IconButton key={action.id} icon={action.icon} onClick={action.click} />
						)
					)}
			</Row>
			{/* IconButton disabled until the actions are active
			<Padding right="medium">
				<IconButton icon="MoreVertical" />
			</Padding>
			*/}
		</Row>
	);
};

const ExpandButton = ({ actions }: { actions: Array<any> }): ReactElement => (
	<Row height="40px" mainAlignment="flex-start" style={{ overflow: 'hidden' }}>
		{actions &&
			map(actions, (action) => (
				<IconButton key={action.id} icon={action.icon} onClick={action.click} />
			))}
	</Row>
);

const DisplayerHeader = ({
	title,
	actions
}: {
	actions: Array<any>;
	title: string;
}): ReactElement => {
	const [t] = useTranslation();
	const eventIsEditable = some(actions, { id: 'edit' });
	const expandedButton = some(actions, { id: 'expand' });

	const close = useCallback(() => {
		replaceHistory(``);
	}, []);

	return (
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
					<Icon icon={eventIsEditable ? 'NewAppointmentOutline' : 'CalendarModOutline'} />
				</Row>
				<Row takeAvailableSpace mainAlignment="flex-start">
					<Text size="medium" overflow="ellipsis">
						{title || t('label.no_subject', 'No subject')}
					</Text>
				</Row>
				{expandedButton && <ExpandButton actions={actions} />}
				<Row padding={{ right: 'extrasmall' }}>
					<IconButton size="medium" icon="CloseOutline" onClick={close} />
				</Row>
			</Row>
			<Divider />

			{eventIsEditable && (
				<Row
					mainAlignment="flex-end"
					crossAlignment="center"
					orientation="horizontal"
					background="gray5"
					width="fill"
					height="48px"
					padding={{ vertical: 'small' }}
				>
					<Row>
						<ActionButtons actions={actions} />
					</Row>
				</Row>
			)}
		</>
	);
};

type ParamsType = {
	calendarId: string;
	apptId: string;
	ridZ?: string;
};
export default function EventPanelView(): ReactElement | null {
	const { calendarId, apptId, ridZ } = useParams<ParamsType>();
	const dispatch = useDispatch();
	const createModal = useContext(ModalManagerContext);
	const tags = useTags();
	const createSnackbar = useContext(SnackbarManagerContext);
	const calendar = useSelector((s: Store) => selectCalendar(s, calendarId));
	const appointment = useSelector((s: Store) => selectAppointment(s, apptId));
	const invite = useInvite(appointment?.inviteId);
	const inst = useSelector((s: Store) => selectAppointmentInstance(s, apptId, ridZ));

	const event = useMemo(() => {
		if (calendar && appointment && inst)
			return normalizeCalendarEvent(calendar, appointment, inst, appointment?.l?.includes(':'));
		return undefined;
	}, [appointment, calendar, inst]);

	const context = useMemo(
		() => ({
			replaceHistory,
			dispatch,
			createModal,
			createSnackbar,
			tags,
			ridZ: event?.resource?.ridZ,
			createAndApplyTag,
			isInstance: true
		}),
		[createModal, createSnackbar, dispatch, event?.resource?.ridZ, tags]
	);

	const actions = useQuickActions(invite, event, context);

	return invite && event ? (
		<AppointmentCardContainer background="gray5" mainAlignment="flex-start">
			<DisplayerHeader title={invite.name} actions={actions} />
			<Container padding={{ all: 'none' }} mainAlignment="flex-start" height="calc(100% - 64px)">
				<BodyContainer
					orientation="vertical"
					mainAlignment="flex-start"
					width="fill"
					height="fit"
					padding={{ all: 'large' }}
					background="gray5"
				>
					<DetailsPart
						event={event}
						subject={invite.name}
						isPrivate={invite.class === 'PRI' ?? false}
						inviteNeverSent={invite.neverSent}
						invite={invite}
					/>
					<StyledDivider />
					{!invite.isOrganizer && !calendar.owner && invite && (
						<>
							<ReplyButtonsPart
								inviteId={invite.id}
								participationStatus={event.resource.participationStatus}
								compNum={invite.compNum}
							/>
							<StyledDivider />
						</>
					)}
					{invite && (
						<ParticipantsPart
							invite={invite}
							organizer={invite.organizer}
							participants={invite?.participants}
						/>
					)}
					{invite && extractBody(invite.textDescription?.[0]?._content) && (
						<>
							<StyledDivider />
							<MessagePart fullInvite={invite} inviteId={invite.id} parts={invite.parts} />
						</>
					)}
					<StyledDivider />
					{invite && <ReminderPart alarmString={invite.alarmString} invite={invite} />}
					{invite?.attachmentFiles.length > 0 && (
						<>
							<StyledDivider />
							<Container padding={{ top: 'small', horizontal: 'large' }} background="gray6">
								<AttachmentsBlock
									attachments={invite?.attachmentFiles}
									id={invite.id}
									subject={invite.name}
								/>
							</Container>
						</>
					)}
				</BodyContainer>
			</Container>
		</AppointmentCardContainer>
	) : null;
}
