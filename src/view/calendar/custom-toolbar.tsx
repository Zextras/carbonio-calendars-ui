/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, ReactElement, useCallback } from 'react';
import styled, { css, SimpleInterpolation } from 'styled-components';
import { useTranslation } from 'react-i18next';
import {
	Container,
	Button,
	IconButton,
	ButtonProps,
	pseudoClasses
} from '@zextras/carbonio-design-system';
import { useAppStatusStore } from '../../store/zustand/store';

const ButtonWrapper = styled.div`
	min-width: fit-content;
	border: 1px solid;
	${({ color = 'primary', theme }): SimpleInterpolation => css`
		${pseudoClasses(theme, color, 'border-color')};
	`};
	&:last-child {
		border-left: none;
		border-radius: 0 2px 2px 0;
	}
	&:first-child {
		border-right: none;
		border-radius: 2px 0 0 2px;
	}
	&:not(:first-child):not(:last-child) {
		border-radius: 0;
		border-right: none;
		border-left: none;
	}
`;

const CustomButton: FC<ButtonProps> = (props: ButtonProps): ReactElement => (
	<ButtonWrapper>
		<Button {...props} style={{ border: 0 }} />
	</ButtonWrapper>
);

export interface CustomToolbarProps {
	label: string;
	onView: (arg: string) => void;
	onNavigate: (arg: string) => void;
	view: string;
}

export const CustomToolbar = ({
	label,
	onView,
	onNavigate,
	view
}: CustomToolbarProps): ReactElement => {
	const [t] = useTranslation();
	const today = useCallback(() => onNavigate('TODAY'), [onNavigate]);
	const next = useCallback(() => onNavigate('NEXT'), [onNavigate]);
	const prev = useCallback(() => onNavigate('PREV'), [onNavigate]);
	const week = useCallback(() => {
		useAppStatusStore.setState({ calendarView: 'week' });
		return onView('week');
	}, [onView]);
	const day = useCallback(() => {
		useAppStatusStore.setState({ calendarView: 'day' });
		return onView('day');
	}, [onView]);
	const month = useCallback(() => {
		useAppStatusStore.setState({ calendarView: 'month' });
		return onView('month');
	}, [onView]);
	const workView = useCallback(() => {
		useAppStatusStore.setState({ calendarView: 'work_week' });
		return onView('work_week');
	}, [onView]);

	return (
		<Container width="fill" height="fit" padding={{ bottom: 'small' }}>
			<Container
				orientation="horizontal"
				width="fill"
				height={48}
				mainAlignment="baseline"
				crossAlignment="stretch"
				background="gray5"
				padding={{ horizontal: 'small' }}
			>
				<Container width="fit" orientation="horizontal" mainAlignment="flex-start">
					<Button
						label={t('label.today', 'today')}
						type="outlined"
						onClick={today}
						style={{ minWidth: 'fit-content' }}
					/>
				</Container>
				<Container orientation="horizontal" mainAlignment="center">
					<IconButton iconColor="primary" icon="ChevronLeft" onClick={prev} />
					<Button type="ghost" label={label} onClick={(): null => null} />
					<IconButton iconColor="primary" icon="ChevronRight" onClick={next} />
				</Container>
				<Container width="fit" orientation="horizontal" mainAlignment="flex-end">
					<CustomButton
						backgroundColor={view === 'month' ? 'highlight' : undefined}
						label={t('label.month', 'month')}
						type="outlined"
						onClick={month}
					/>
					<CustomButton
						backgroundColor={view === 'week' ? 'highlight' : undefined}
						label={t('label.week', 'week')}
						type="outlined"
						onClick={week}
					/>
					<CustomButton
						backgroundColor={view === 'day' ? 'highlight' : undefined}
						label={t('label.day', 'day')}
						type="outlined"
						onClick={day}
					/>
					<CustomButton
						backgroundColor={view === 'work_week' ? 'highlight' : undefined}
						label={t('label.work_week', 'work week')}
						type="outlined"
						onClick={workView}
					/>
				</Container>
			</Container>
		</Container>
	);
};
