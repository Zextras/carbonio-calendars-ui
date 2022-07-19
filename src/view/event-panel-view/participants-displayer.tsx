/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
	Avatar,
	Container,
	IconButton,
	Row,
	Text,
	TextWithTooltip
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import React, { ReactElement, useCallback, useMemo, useState } from 'react';
import { InviteParticipant, InviteParticipants } from '../../types/store/invite';

const DisplayedParticipant = ({
	participant
}: {
	participant: InviteParticipant;
}): ReactElement => {
	const [t] = useTranslation();
	return (
		<Row mainAlignment="flex-start" crossAlignment="center" padding={{ vertical: 'small' }}>
			<Avatar
				label={participant.name || participant.email}
				style={{ width: '48px', height: '48px' }}
			/>
			<Row
				mainAlignment="flex-start"
				crossAlignment="center"
				takeAvailableSpace
				padding={{ left: 'small' }}
			>
				<TextWithTooltip overflow="ellipsis">
					{participant.name || participant.email}
					<br />
					<Text size="small" color="secondary">
						{`(${
							participant.isOptional
								? t('label.optional', 'Optional')
								: t('label.required', 'Required')
						})`}
					</Text>
				</TextWithTooltip>
			</Row>
		</Row>
	);
};

type DropdownProps = {
	label: string;
	participants?: Array<InviteParticipant>;
	width: string;
};

const Dropdown = ({ label, participants, width }: DropdownProps): ReactElement | null => {
	const [isExpanded, setIsExpanded] = useState(true);
	const toggleExpanded = useCallback(() => setIsExpanded((prevExpanded) => !prevExpanded), []);

	const displayedParticipants = useMemo(
		() => (
			<Container mainAlignment="space-between" crossAlignment="flex-start" wrap="wrap" width="fill">
				{participants?.map((participant) => (
					<DisplayedParticipant participant={participant} key={participant.email} />
				))}
			</Container>
		),
		[participants]
	);

	return participants ? (
		<>
			{participants?.length > 0 && (
				<Container
					orientation="vertical"
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					width={width}
					height="fit"
				>
					<Row mainAlignment="flex-start" takeAvailableSpace>
						<Text size="small">{label}</Text>
						<IconButton
							icon={isExpanded ? 'ChevronUp' : 'ChevronDown'}
							onClick={toggleExpanded}
							size="small"
						/>
					</Row>
					{isExpanded && displayedParticipants}
				</Container>
			)}
		</>
	) : null;
};

export const ParticipantsDisplayer = ({
	participants
}: {
	participants: InviteParticipants;
}): ReactElement | null => {
	const [t] = useTranslation();
	const width = Object.keys(participants).length === 1 ? '100%' : '50%';

	if (Object.keys(participants).length === 0) return null;
	return (
		<Container
			wrap="wrap"
			orientation="horizontal"
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			width="fill"
			height="fit"
			padding={{ top: 'large' }}
		>
			{participants?.AC?.length > 0 && (
				<Dropdown
					label={t('participants.AC_with_count', {
						count: participants.AC?.length ?? 0,
						defaultValue: 'Accepted',
						defaultValue_plural: 'Accepted ({{count}})'
					}).toUpperCase()}
					participants={participants.AC}
					width={width}
				/>
			)}
			{participants?.NE?.length > 0 && (
				<Dropdown
					label={t('participants.NE_with_count', {
						count: participants.NE?.length ?? 0,
						defaultValue: "Didn't answer ({{count}})",
						defaultValue_plural: "Didn't answer ({{count}})"
					}).toUpperCase()}
					participants={participants.NE}
					width={width}
				/>
			)}
			{participants?.TE?.length > 0 && (
				<Dropdown
					label={t('participants.TE_with_count', {
						count: participants?.TE?.length ?? 0,
						defaultValue: 'Tentative',
						defaultValue_plural: 'Tentative ({{count}})'
					}).toUpperCase()}
					participants={participants.TE}
					width={width}
				/>
			)}
			{participants?.DE?.length > 0 && (
				<Dropdown
					label={t('participants.DE_with_count', {
						count: participants.DE?.length ?? 0,
						defaultValue: 'Declined',
						defaultValue_plural: 'Declined ({{count}})'
					}).toUpperCase()}
					participants={participants.DE}
					width={width}
				/>
			)}
		</Container>
	);
};
